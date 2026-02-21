export const COURSE_DATA = {
  beginner: [
    { id: 'b1', name: 'Lesson 1: ለ Group', text: 'ለ ሉ ሊ ላ ሌ ል ሎ ለ ሉ ሊ ላ ሌ ል ሎ', minAccuracy: 85, hasTimer: false },
    { id: 'b2', name: 'Lesson 2: መ Group', text: 'መ ሙ ሚ ማ ሜ ም ሞ መ ሙ ሚ ማ ሜ ም ሞ', minAccuracy: 85, hasTimer: false },
    { id: 'b3', name: 'Lesson 3: ሰ Group', text: 'ሰ ሱ ሲ ሳ ሴ ስ ሶ ሰ ሱ ሲ ሳ ሴ ስ ሶ', minAccuracy: 85, hasTimer: false },
    { id: 'b4', name: 'Lesson 4: ረ Group', text: 'ረ ሩ ሪ ራ ሬ ር ሮ ረ ሩ ሪ ራ ሬ ር ሮ', minAccuracy: 85, hasTimer: false },
    { id: 'b5', name: 'Lesson 5: በ Group', text: 'በ ቡ ቢ ባ ቤ ብ ቦ በ ቡ ቢ ባ ቤ ብ ቦ', minAccuracy: 85, hasTimer: false },
    { id: 'b6', name: 'Lesson 6: ተ Group', text: 'ተ ቱ ቲ ታ ቴ ት ቶ ተ ቱ ቲ ታ ቴ ት ቶ', minAccuracy: 85, hasTimer: false },
    { id: 'b7', name: 'Lesson 7: ነ Group', text: 'ነ ኑ ኒ ና ኔ ን ኖ ነ ኑ ኒ ና ኔ ን ኖ', minAccuracy: 85, hasTimer: false },
    { id: 'b8', name: 'Lesson 8: ከ Group', text: 'ከ ኩ ኪ ካ ኬ ክ ኮ ከ ኩ ኪ ካ ኬ ክ ኮ', minAccuracy: 85, hasTimer: false },
  ],
  elementary: [
    { id: 'e1', name: 'Lesson 1: Simple Words', text: 'ሰላም፡ ቤት፡ አባት፡ እናት፡ ልጅ፡ ውሻ፡ ድመት', minAccuracy: 80, minWPM: 10, hasTimer: true, timeLimit: 180 },
    { id: 'e2', name: 'Lesson 2: Common Words', text: 'ውሃ፡ እንጀራ፡ ቡና፡ ወተት፡ ዳቦ፡ ስጋ፡ አትክልት', minAccuracy: 80, minWPM: 10, hasTimer: true, timeLimit: 180 },
    { id: 'e3', name: 'Lesson 3: Action Words', text: 'መጣ፡ ሄደ፡ በላ፡ ጠጣ፡ ተኛ፡ ተነሳ፡ ተቀመጠ', minAccuracy: 80, minWPM: 12, hasTimer: true, timeLimit: 180 },
    { id: 'e4', name: 'Lesson 4: Mixed Practice', text: 'ልጁ ወተት ጠጣ፡ እናቴ እንጀራ ሰራች፡ አባቴ ቡና ጠጣ', minAccuracy: 80, minWPM: 12, hasTimer: true, timeLimit: 180 },
  ],
  intermediate: [
    { id: 'i1', name: 'Lesson 1: Short Sentences', text: 'ሰላም። እንዴት ነህ? ደህና ነኝ። አመሰግናለሁ። እንኳን ደህና መጣህ።', minAccuracy: 85, minWPM: 15, hasTimer: true, timeLimit: 240 },
    { id: 'i2', name: 'Lesson 2: Daily Phrases', text: 'ዛሬ ቆንጆ ቀን ነው። ወደ ቤት እሄዳለሁ። ምግብ እበላለሁ። ውሃ እጠጣለሁ።', minAccuracy: 85, minWPM: 15, hasTimer: true, timeLimit: 240 },
    { id: 'i3', name: 'Lesson 3: Conversations', text: 'ስምህ ማን ነው? የት ትኖራለህ? ምን ትሰራለህ? ስንት ዓመትህ ነው?', minAccuracy: 85, minWPM: 18, hasTimer: true, timeLimit: 240 },
  ],
  advanced: [
    { id: 'a1', name: 'Lesson 1: Paragraph', text: 'ኢትዮጵያ በምስራቅ አፍሪካ የምትገኝ ሀገር ናት። ታሪካዊ እና ባህላዊ ሀብት ያላት ሀገር ናት። የተለያዩ ብሔረሰቦች በሰላም የሚኖሩበት ቦታ ናት። የአፍሪካ ቀንድ ተብላ ትጠራለች።', minAccuracy: 90, minWPM: 20, hasTimer: true, timeLimit: 300 },
    { id: 'a2', name: 'Lesson 2: Story', text: 'በአንድ ወቅት አንድ ገበሬ ነበር። በየቀኑ ወደ እርሻው ይሄድ ነበር። ጠንክሮ ይሰራ ነበር። ምርቱን ወደ ገበያ ይወስድ ነበር። ከዚያ ገንዘብ ያገኝ ነበር። ቤተሰቡን ይመግብ ነበር።', minAccuracy: 90, minWPM: 22, hasTimer: true, timeLimit: 300 },
  ],
  expert: [
    { id: 'x1', name: '1 Minute Challenge', text: 'ትምህርት የሰው ልጅ እድገት መሰረት ነው። ያለ ትምህርት ማንም ሰው ወደ ፊት መሄድ አይችልም። ትምህርት እውቀትን ይሰጣል። እውቀት ሀብትን ይሰጣል። ሀብት ደስታን ይሰጣል። ስለዚህ ሁሉም ሰው መማር አለበት።', minAccuracy: 95, minWPM: 25, hasTimer: true, timeLimit: 60, mode: 'challenge' },
    { id: 'x2', name: '3 Minute Challenge', text: 'የኢትዮጵያ ታሪክ በጣም ጥንታዊ ነው። ከብዙ ሺህ ዓመታት በፊት ይጀምራል። ብዙ ነገስታት ነግሰዋል። ብዙ ጦርነቶች ተደርገዋል። ብዙ ድሎች ተገኝተዋል። ሀገሪቱ በጭራሽ አልተገዛችም። ነፃነቷን ጠብቃለች። ይህ ታሪክ ኩራት ነው። ለሁሉም ኢትዮጵያውያን ኩራት ነው። ለወደፊቱም ኩራት ይሆናል።', minAccuracy: 95, minWPM: 30, hasTimer: true, timeLimit: 180, mode: 'challenge' },
    { id: 'x3', name: '5 Minute Marathon', text: 'ቴክኖሎጂ በዘመናችን በጣም አስፈላጊ ነው። ሁሉም ሰው ስልክ አለው። ሁሉም ሰው ኮምፒውተር ይጠቀማል። ኢንተርኔት በየቦታው አለ። መረጃ በቀላሉ ይገኛል። ሰዎች በቀላሉ ይግባቡ። ንግድ በቀላሉ ይከናወናል። ትምህርት በቀላሉ ይሰጣል። ነገር ግን ጥንቃቄ ማድረግ አለብን። ቴክኖሎጂ መጥፎ ጎኑም አለው። ብዙ ሰዎች ሱስ ይሆናሉ። ብዙ ሰዎች ጊዜያቸውን ያባክናሉ። ስለዚህ በጥበብ መጠቀም አለብን። ቴክኖሎጂን መቆጣጠር አለብን። እንጂ ቴክኖሎጂ እኛን መቆጣጠር የለበትም።', minAccuracy: 95, minWPM: 35, hasTimer: true, timeLimit: 300, mode: 'challenge' },
  ]
}
