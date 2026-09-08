import './DemandTest.css'

// Authored practice: native disclosures work with a keyboard and without JavaScript.
const exercises = {
  en: [
    {
      title: '1. Choose an opening question',
      situation: 'You are exploring software for training centres. You want to understand how managers handle class changes. Which question would you start with?',
      options: [
        ['Would an app make your work easier?', 'This asks the manager to imagine your solution. A yes would not tell you what happened, what was difficult, or whether anything needs to change. Try asking about a recent class change.'],
        ['Could you walk me through the most recent class change you handled?', 'This is a useful starting point: a specific event the manager can describe. Follow up on what they did, who was involved, and what went wrong, if anything. A recent event is still a report to understand, not proof they will buy.'],
        ['How much would you pay for my app?', 'A guessed price gives you little context this early. First understand the work and current alternatives. Later, test a specific offer with clear scope and price.']
      ]
    },
    {
      title: '2. Decide what the evidence says',
      situation: 'In this fictional test, eight managers reply. Five only say the idea sounds useful. Two describe a recent scheduling problem. One says their current system works well. What can you reasonably conclude?',
      options: [
        ['Seven out of eight need the product. Start building.', 'That combines compliments with accounts of a problem. Neither tells you that seven people need this product or would pay for it. Keep the two kinds of response separate.'],
        ['Explore the two recent problems and understand the existing alternative.', 'This is a defensible next step. Ask how serious the problems were and how they were handled. Learn why the other manager is satisfied too. You still do not know willingness to pay or how common this is across the market.'],
        ['Only two reported a problem, so there is no market.', 'This small, selected group cannot settle that question. Check whom you reached, whether the problem is occasional, and whether your questions missed something. You may change the segment or pause, but explain the uncertainty.']
      ]
    },
    {
      title: '3. Handle a test that did not reach people',
      situation: 'You planned to interview eight managers by Friday. Only one replies to your invitation. What should your review say?',
      options: [
        ['The other seven do not want the product.', 'A non-response is not a product rejection. You do not know whether they saw the invitation, had time, or understood why you contacted them. Record the recruitment problem.'],
        ['Keep extending the test until enough people say yes.', 'Moving the deadline until you get a preferred result hides what happened. End and record this test, then decide whether a new recruitment approach deserves a separate bounded attempt.'],
        ['The test is inconclusive. Review recruitment before testing again.', 'Yes. Record one reply out of eight invitations and what you actually learned from it. If you try again, change a named part of recruitment, keep a spending limit, and set a new review date.']
      ]
    }
  ],
  bn: [
    {
      title: '১. প্রথম প্রশ্নটি বেছে নিন',
      situation: 'আপনি ট্রেনিং সেন্টারগুলোর জন্য একটি সফটওয়্যার তৈরি করতে চাচ্ছেন। আপনি বুঝতে চান ম্যানেজাররা কীভাবে ক্লাস চেঞ্জ বা শিডিউল পরিবর্তন সামলান। আপনি কোন প্রশ্ন দিয়ে শুরু করবেন?',
      options: [
        ['একটি অ্যাপ কি আপনার কাজকে আরও সহজ করবে?', 'এই প্রশ্নটি ম্যানেজারকে আপনার সলিউশনটি কল্পনা করতে বলছে। শুধু একটি "হ্যাঁ" উত্তর আপনাকে জানাবে না যে আসলে কী ঘটেছিল, কী কী অসুবিধা ছিল, বা আদৌ কিছু পরিবর্তন করার দরকার আছে কি না। সম্প্রতি তাদের কোনো ক্লাস চেঞ্জ করার অভিজ্ঞতা নিয়ে প্রশ্ন করার চেষ্টা করুন।'],
        ['আপনি কি আমাকে জানাতে পারবেন সম্প্রতি কীভাবে আপনি একটি ক্লাস চেঞ্জ সামলেছেন?', 'এটি শুরু করার জন্য বেশ কাজের: একটি নির্দিষ্ট ঘটনা যা ম্যানেজার বর্ণনা করতে পারবেন। তাঁরা কী করেছিলেন, কে কে যুক্ত ছিলেন এবং কোনো সমস্যা হয়েছিল কি না – সেগুলো সম্পর্কে আরও জানতে চান। মনে রাখবেন, সাম্প্রতিক একটি ঘটনা শুধু বোঝার জন্য, এটি প্রমাণ করে না যে তাঁরা আপনার প্রোডাক্ট কিনবেনই।'],
        ['আমার অ্যাপটির জন্য আপনি কত টাকা দিতে রাজি হবেন?', 'এত শুরুতে অনুমানের ওপর ভিত্তি করে দাম জানতে চাইলে আপনি খুব একটা ধারণা পাবেন না। আগে তাঁদের কাজ এবং বর্তমান বিকল্পগুলো সম্পর্কে বুঝুন। পরে একটি নির্দিষ্ট অফার (যাতে স্কোপ ও দাম উল্লেখ থাকবে) নিয়ে টেস্ট করুন।']
      ]
    },
    {
      title: '২. প্রমাণ থেকে সিদ্ধান্ত নিন',
      situation: 'এই কাল্পনিক টেস্টে আটজন ম্যানেজার রিপ্লাই দিয়েছেন। পাঁচজন বলছেন যে আইডিয়াটি বেশ কাজের মনে হচ্ছে। দুজন তাদের সাম্প্রতিক কোনো শিডিউলিং সমস্যার কথা জানালেন। একজন বলছেন যে তাদের বর্তমান সিস্টেম বেশ ভালোই কাজ করছে। এই পরিস্থিতি থেকে আপনি যুক্তিসঙ্গতভাবে কী উপসংহার টানতে পারেন?',
      options: [
        ['আটজনের মধ্যে সাতজনেরই প্রোডাক্টটি দরকার। প্রোডাক্ট বানানো শুরু করে দিন।', 'আপনি এখানে মানুষের প্রশংসা এবং সমস্যার কথা – দুটোকে মিলিয়ে ফেলছেন। এর কোনোটিই প্রমাণ করে না যে সাতজনেরই এই প্রোডাক্টটি দরকার বা তারা এর জন্য টাকা দেবে। এই দুই ধরনের রেসপন্সকে আলাদাভাবে বিচার করুন।'],
        ['যে দুটি সাম্প্রতিক সমস্যার কথা জানা গেছে তা নিয়ে বিস্তারিত জানুন এবং বর্তমান বিকল্পগুলো বুঝার চেষ্টা করুন।', 'এটি একটি যুক্তিসঙ্গত পরবর্তী পদক্ষেপ। সমস্যাগুলো কতটা গুরুতর ছিল এবং কীভাবে তা সমাধান করা হয়েছিল তা নিয়ে প্রশ্ন করুন। অন্য ম্যানেজারটি কেন সন্তুষ্ট সেটাও জানার চেষ্টা করুন। আপনি এখনও জানেন না যে তারা টাকা দিতে ইচ্ছুক কিনা বা মার্কেটে এই সমস্যাটি কতটা সাধারণ।'],
        ['যেহেতু মাত্র দুজন সমস্যার কথা জানিয়েছেন, তার মানে এর কোনো মার্কেট নেই।', 'এত ছোট একটি গ্রুপ দিয়ে এই প্রশ্নের সমাধান করা সম্ভব নয়। আপনি কাদের সাথে কথা বলেছেন, সমস্যাটি কি মাঝে মাঝে হয়, এবং আপনার প্রশ্নগুলোতে কোনো ঘাটতি ছিল কি না – তা চেক করুন। আপনি চাইলে টার্গেট সেগমেন্ট পরিবর্তন করতে পারেন বা কিছুদিনের জন্য কাজ থামাতে পারেন, তবে এই অনিশ্চয়তাগুলোর পেছনের কারণ ব্যাখ্যা করুন।']
      ]
    },
    {
      title: '৩. এমন একটি টেস্টের মূল্যায়ন করুন যা মানুষের কাছে পৌঁছাতে পারেনি',
      situation: 'আপনি শুক্রবারের মধ্যে আটজন ম্যানেজারের ইন্টারভিউ নেওয়ার প্ল্যান করেছিলেন। কিন্তু আপনার ইনভাইটেশনের রিপ্লাই দিয়েছেন মাত্র একজন। আপনার রিভিউতে কী থাকা উচিত?',
      options: [
        ['বাকি সাতজন আসলে প্রোডাক্টটি চায় না।', 'রিপ্লাই না দেওয়ার মানে এই নয় যে তারা প্রোডাক্টটি বাতিল করে দিয়েছেন। আপনি জানেন না তারা ইনভাইটেশনটি দেখেছিল কি না, তাদের কাছে সময় ছিল কি না বা আপনি কেন তাদের সাথে যোগাযোগ করেছেন তা তারা বুঝতে পেরেছিল কি না। বরং এই রিক্রুটমেন্ট সমস্যাটি রেকর্ড করে রাখুন।'],
        ['যতক্ষণ না পর্যন্ত পর্যাপ্ত সংখ্যক মানুষ "হ্যাঁ" বলছে, টেস্টটির সময়সীমা বাড়াতে থাকুন।', 'কাঙ্ক্ষিত ফলাফল না পাওয়া পর্যন্ত ডেডলাইন পেছাতে থাকলে আসলে কী ঘটেছিল তা ঢাকা পড়ে যায়। এই টেস্টটি এখানেই শেষ করুন এবং ফলাফল রেকর্ড করুন। এরপর সিদ্ধান্ত নিন নতুন কোনো রিক্রুটমেন্ট পদ্ধতিতে আরেকটি নির্দিষ্ট টেস্ট করা যায় কি না।'],
        ['টেস্টটি অমীমাংসিত বা সিদ্ধান্তহীন। পুনরায় টেস্ট করার আগে রিক্রুটমেন্ট প্রক্রিয়াটি রিভিউ করুন।', 'হ্যাঁ। আটটি ইনভাইটেশনের মধ্যে যে একটি রিপ্লাই এসেছে তা রেকর্ড করুন এবং সেখান থেকে আপনি আসলে কী শিখতে পেরেছেন তা লিখে রাখুন। আপনি যদি আবার চেষ্টা করতে চান, তবে রিক্রুটমেন্ট প্রসেসের নির্দিষ্ট কোনো অংশ পরিবর্তন করুন, খরচের একটি সীমা ঠিক রাখুন এবং নতুন একটি রিভিউ ডেট সেট করুন।']
      ]
    }
  ]
}

interface DemandTestPracticeProps {
  locale?: 'bn' | 'en'
}

export default function DemandTestPractice({ locale = 'bn' }: DemandTestPracticeProps) {
  const isEn = locale === 'en'
  const currentExercises = isEn ? exercises.en : exercises.bn

  return (
    <div className="demand-practice">
      <p>
        {isEn
          ? 'Choose an answer to reveal its explanation. Compare the other answers afterward. These are fictional exercises, not customer research results.'
          : 'ব্যাখ্যা জানতে যেকোনো একটি উত্তরে ক্লিক করুন। এরপর অন্য উত্তরগুলোর সাথে তুলনা করে দেখুন। এগুলো কাল্পনিক অনুশীলনী, আসল কাস্টমার রিসার্চের ফলাফল নয়।'}
      </p>
      {currentExercises.map(exercise => (
        <section className="demand-practice__case" key={exercise.title}>
          <h3>{exercise.title}</h3>
          <p>{exercise.situation}</p>
          {exercise.options.map(([answer, feedback]) => (
            <details key={answer}>
              <summary>{answer}</summary>
              <p><strong>{isEn ? 'Why:' : 'কারণ:'}</strong> {feedback}</p>
            </details>
          ))}
        </section>
      ))}
    </div>
  )
}
