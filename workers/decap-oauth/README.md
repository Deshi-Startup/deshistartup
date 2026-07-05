# Decap CMS GitHub OAuth Worker

Decap CMS needs a small OAuth proxy when using the GitHub backend from a static site. This Worker handles:

- `/auth`: starts the GitHub OAuth flow for Decap CMS.
- `/callback`: exchanges the GitHub OAuth code for an access token and sends it back to the Decap popup.
- Signed, short-lived OAuth state.
- A fixed allowed site origin so another site cannot receive an editor token.

## 1. Create the GitHub OAuth app

Create a GitHub OAuth App from the GitHub organization or account that owns the repo:

- Application name: `Deshi Startup CMS`
- Homepage URL: `https://deshi-startup.github.io/deshistartup`
- Authorization callback URL: `https://<your-oauth-worker-domain>/callback`

After the app is created, keep the Client ID and generate a Client Secret.

## 2. Configure the Worker

Copy the example Wrangler file:

```sh
cp workers/decap-oauth/wrangler.toml.example workers/decap-oauth/wrangler.toml
```

Update `SITE_ORIGIN`, `ALLOWED_ORIGINS`, and `ALLOWED_SITE_IDS` if the site moves to a custom domain.

Set secrets:

```sh
cd workers/decap-oauth
npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
npx wrangler secret put OAUTH_STATE_SECRET
```

Use a long random value for `OAUTH_STATE_SECRET`, for example a password manager generated secret.

Deploy:

```sh
npx wrangler deploy
```

## 3. Wire Decap CMS to the deployed Worker

After deployment, update `public/admin/config.yml`:

```yml
backend:
  name: github
  repo: Deshi-Startup/deshistartup
  branch: main
  base_url: https://<your-oauth-worker-domain>
  auth_endpoint: auth
```

The GitHub OAuth callback URL must exactly match the deployed Worker callback URL:

```txt
https://<your-oauth-worker-domain>/callback
```

## 4. Give editors access

Editors who log in through `/admin/` still need GitHub write access to `Deshi-Startup/deshistartup`. Add trusted editors as collaborators or organization members with the minimum repo permissions they need.

Keep branch protection on `main`: require review and passing checks before merge. Decap editorial workflow will create reviewable changes instead of directly publishing.

## 5. Local CMS testing

For local content editing, run the Decap local backend instead of GitHub OAuth:

```sh
npx decap-server
npm run dev
```

Decap local backend is for local editing convenience. Production editorial review still uses GitHub, the OAuth Worker, and the configured branch protection rules.
