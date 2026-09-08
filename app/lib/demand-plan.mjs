// Original worksheet prompts. The output records a plan, never a validation verdict.
export const getDemandPlanFields = (locale = 'bn') => {
  const isEn = locale === 'en'

  return [
    {
      id: 'customer',
      label: isEn ? 'Who will you learn from?' : 'আপনি কাদের কাছ থেকে শিখবেন?',
      hint: isEn ? 'Name a specific group you can reach. Include the job they do and where you will find them.' : 'এমন একটি নির্দিষ্ট দলের নাম লিখুন যাদের কাছে আপনি পৌঁছাতে পারবেন। তারা কী কাজ করে এবং তাদের কোথায় পাবেন তা অন্তর্ভুক্ত করুন।'
    },
    {
      id: 'assumption',
      label: isEn ? 'What needs to be true?' : 'অনুমানটি সত্যি হতে হলে কী ঘটতে হবে?',
      hint: isEn ? 'Choose one uncertain belief. What problem or behaviour would you need to observe?' : 'এমন একটি বিশ্বাস বেছে নিন যা নিয়ে আপনি নিশ্চিত নন। আপনার কী সমস্যা বা আচরণ দেখা প্রয়োজন?'
    },
    {
      id: 'recruitment',
      label: isEn ? 'How will you reach them?' : 'আপনি তাদের কাছে কীভাবে পৌঁছাবেন?',
      hint: isEn ? 'Write where, how many people you will invite, and who qualifies. Allow for people who do not reply.' : 'কোথায়, কতজনকে আমন্ত্রণ জানাবেন ও কারা যোগ্য তা লিখুন। যারা উত্তর দেবে না তাদের কথাও বিবেচনায় রাখুন।'
    },
    {
      id: 'test',
      label: isEn ? 'What will you do?' : 'আপনি কী করবেন?',
      hint: isEn ? 'Describe one small test and the questions or offer you will use. Explain honestly what exists today.' : 'একটি ছোট টেস্ট ও আপনি যে প্রশ্ন বা অফার ব্যবহার করবেন তার বর্ণনা দিন। বর্তমানে কী আছে তা সৎভাবে ব্যাখ্যা করুন।'
    },
    {
      id: 'evidence',
      label: isEn ? 'What will you record?' : 'আপনি কী রেকর্ড করবেন?',
      hint: isEn ? 'Specify observable events or actions. Record how many people were invited, replied, and took the action separately.' : 'পর্যবেক্ষণযোগ্য ঘটনা বা কাজগুলো নির্দিষ্ট করুন। কতজনকে আমন্ত্রণ জানানো হয়েছে, কতজন উত্তর দিয়েছে ও কতজন কাজটিতে অংশ নিয়েছে তা আলাদাভাবে রেকর্ড করুন।'
    },
    {
      id: 'decision',
      label: isEn ? 'What would change your next step?' : 'আপনার পরের পদক্ষেপ কী কারণে বদলাতে পারে?',
      hint: isEn ? 'Write what would justify another test, what would make you reconsider, and what would leave you unsure. Choose your rule before seeing results.' : 'কী হলে আরেকটি টেস্ট করা যৌক্তিক হবে, কী হলে আপনি পুনরায় বিবেচনা করবেন এবং কী হলে আপনি অনিশ্চিত থাকবেন তা লিখুন। ফলাফল দেখার আগেই আপনার নিয়ম ঠিক করুন।'
    },
    {
      id: 'limits',
      label: isEn ? 'What are your limits?' : 'আপনার সীমাবদ্ধতাগুলো কী?',
      hint: isEn ? 'Set a maximum spend in BDT, hours available, and an end date. Zero additional spend is an option.' : 'টাকায় সর্বোচ্চ কত খরচ করবেন, কত ঘণ্টা সময় দিতে পারবেন এবং একটি শেষ তারিখ ঠিক করুন। অতিরিক্ত কোনো খরচ না করাও একটি বিকল্প হতে পারে।'
    },
    {
      id: 'next',
      label: isEn ? 'What is your first action and review date?' : 'আপনার প্রথম কাজ ও পর্যালোচনার তারিখ কী?',
      hint: isEn ? 'Name who will do the first action and when. Set a date to review the evidence, even if the test is incomplete.' : 'প্রথম কাজটি কে করবে ও কখন করবে তা লিখুন। টেস্ট অসম্পূর্ণ থাকলেও প্রমাণগুলো পর্যালোচনা করার জন্য একটি তারিখ ঠিক করুন।'
    }
  ]
}

export function formatDemandPlan(values = {}, locale = 'bn') {
  const isEn = locale === 'en'
  const fields = getDemandPlanFields(locale)
  const notFilledText = isEn ? '[Not filled in]' : '[পূরণ করা হয়নি]'

  const sections = fields.map(({ id, label, hint }) => {
    const value = typeof values[id] === 'string' ? values[id].trim() : ''
    return `${label}\n${value || `${notFilledText} ${hint}`}`
  })

  const title = isEn ? 'MY DEMAND TEST PLAN' : 'আমার ডিমান্ড টেস্ট প্ল্যান'
  const url = isEn ? 'Deshi Startup · https://deshistartup.com/en/journeys/test-demand' : 'Deshi Startup · https://deshistartup.com/journeys/test-demand'
  const subtitle = isEn ? 'This is a plan for collecting evidence, not proof that demand exists.' : 'এটি প্রমাণ সংগ্রহের একটি প্ল্যান, ডিমান্ড আছে তার প্রমাণ নয়।'
  const afterTest = isEn ? 'AFTER THE TEST\nWhat happened (including refusals and non-responses):\nWhat supports the assumption:\nWhat contradicts it:\nWhat remains unknown:\nDecision and next action:' : 'টেস্টের পরে\nকী ঘটেছে (প্রত্যাখ্যান ও উত্তর না দেওয়াসহ):\nকী অনুমানটিকে সমর্থন করে:\nকী এর বিরোধিতা করে:\nকী অজানা থেকে গেছে:\nসিদ্ধান্ত ও পরের পদক্ষেপ:'
  const warning = isEn ? 'Keep personal details out of shared notes. Record exact quotes only with permission.' : 'শেয়ার করা নোটে ব্যক্তিগত তথ্য রাখবেন না। কেবল অনুমতি নিয়ে হুবহু কথা রেকর্ড করুন।'

  return [
    title,
    url,
    subtitle,
    ...sections,
    afterTest,
    warning
  ].join('\n\n') + '\n'
}
