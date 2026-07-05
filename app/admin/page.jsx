export const metadata = {
  title: 'Deshi Startup Editor',
  robots: {
    index: false,
    follow: false
  }
}

export default function AdminPage() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'window.CMS_MANUAL_INIT = true' }} />
      <script src="https://unpkg.com/decap-cms@latest/dist/decap-cms.js" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const basePath = window.location.pathname.replace(/\\/admin\\/?$/, '')
            window.CMS.init({
              config: {
                load_config_file: basePath + '/admin/config.yml'
              }
            })
          `
        }}
      />
    </>
  )
}
