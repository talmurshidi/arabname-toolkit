function replaceFilterNameOrder(txt) {
  if (txt) {
    txt = txt.replaceAll('`', '');
    txt = txt.replaceAll('ʿ', '');
    txt = txt.replaceAll('ʾ', '');
    txt = txt.replaceAll(/'/g, '');
    txt = txt.replaceAll('^', '');
    txt = txt.replaceAll('°', '');
    txt = txt.replaceAll('Ā', 'A');
    txt = txt.replaceAll('â', 'a');
    txt = txt.replaceAll('ā', 'a');
    txt = txt.replaceAll('Ṣ', 'S');
    txt = txt.replaceAll('ṣ', 's');
    txt = txt.replaceAll('Ḥ', 'H');
    txt = txt.replaceAll('ḥ', 'h');
    txt = txt.replaceAll('û', 'u');
    txt = txt.replaceAll('ū', 'u');
    txt = txt.replaceAll('Û', 'U');
    txt = txt.replaceAll('Ū', 'U');
    txt = txt.replaceAll('Ṭ', 'T');
    txt = txt.replaceAll('ṭ', 't');
    txt = txt.replaceAll('î', 'i');
    txt = txt.replaceAll('Î', 'I');
    txt = txt.replaceAll('ī', 'i');
    txt = txt.replaceAll('Ī', 'I');
    txt = txt.replaceAll('Ḍ', 'D');
    txt = txt.replaceAll('ḍ', 'd');
    txt = txt.replaceAll('ẓ', 'z');
  }
  return txt;
}

function fixBrillChar(txt) {
  if (txt) {
    txt = txt.replaceAll('û', 'ū');
    txt = txt.replaceAll('Û', 'Ū');
    txt = txt.replaceAll('`', 'ʿ');
    txt = txt.replaceAll('A^', 'Ā');
    txt = txt.replaceAll('a^', 'ā');
    txt = txt.replaceAll('â', 'ā');
    txt = txt.replaceAll(/'/g, 'ʾ');
    txt = txt.replaceAll('î', 'ī');
    txt = txt.replaceAll('Î', 'Ī');
    txt = txt.replaceAll('I^', 'Ī');
    txt = txt.replaceAll('t°', 'ṭ');
    txt = txt.replaceAll('D°', 'Ḍ');
    txt = txt.replaceAll('h°', 'ḥ');
    txt = txt.replaceAll('H°', 'Ḥ');
    txt = txt.replaceAll('s°', 'ṣ');
    txt = txt.replaceAll('z°', 'ẓ');
    txt = txt.replaceAll('Z°', 'Ẓ');
    txt = txt.replaceAll('S°', 'Ṣ');
    txt = txt.replaceAll('d°', 'ḍ');
    txt = txt.replaceAll('T°', 'Ṭ');
  }
  return txt;
}

function capitalizeFirstLetter(string) {
  if (string.charAt(0).includes('ʿ') || string.charAt(0).includes('ʾ')) {
    return string.charAt(0) + string.charAt(1).toUpperCase() + string.slice(2);
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function removeHarakat(txt) {
  if (txt) {
    txt = txt.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '');
  }
  return txt;
}

function transliterationToArabic(txt) {
  if (txt) {
    txt = applyArabicHarakatTransliteration(txt);
    txt = removeHarakat(txt);
  }
  return txt;
}

function isIncludeDashAtEnd(txt) {
  if (
    txt.toLowerCase().endsWith(', al-') ||
    txt.toLowerCase().endsWith(', al- ') ||
    txt.toLowerCase().endsWith('al-') ||
    txt.toLowerCase().endsWith('al- ')
  )
    return true;
  return false;
}

function isIncludeBracket(txt) {
  if (txt.toLowerCase().startsWith('(') || txt.toLowerCase().endsWith(')')) return true;
  return false;
}

function fixALWithDashBetweenBrackets(txt) {
  if (txt) {
    txt = txt.replaceAll('(', '');
    txt = txt.replaceAll(')', '');
    txt = txt.trim();
    if (isIncludeDashAtEnd(txt)) txt = fixALWithDash(txt);
    txt = txt.trim();
    txt = '(' + txt + ')';
  }
  return txt;
}

function fixALWithDash(txt) {
  if (txt) {
    let splitStr = txt.trim().split(' ');
    let splitComma = txt.trim().split(',');
    if (splitStr.length === 2 && isIncludeDashAtEnd(txt)) {
      txt = txt.trim();
      txt = txt.replaceAll(/, al- /gi, '');
      txt = txt.replaceAll(/, al-/gi, '');
      txt = txt.trim();
      txt = 'al-' + txt;
    } else if (splitStr.length === 3 && splitComma.length === 2 && isIncludeDashAtEnd(txt)) {
      txt = splitComma[1].trim() + ' ' + splitComma[0].trim();
      txt = txt.replaceAll(/al- /gi, 'al-');
    }
    txt = txt.trim();
  }
  return txt;
}

function fixAlDashAndBracket(txt) {
  if (txt) {
    txt = fixBrillChar(txt);
    if (isIncludeBracket(txt) && txt.toLowerCase().includes('al-')) {
      let dashesBrackets = txt.split('(');
      let joinedStr = '';
      dashesBrackets.forEach((element) => {
        if (element.includes(')')) joinedStr += fixALWithDashBetweenBrackets(element) + ' ';
        else joinedStr += fixALWithDash(element) + ' ';
      });
      txt = joinedStr.trim();
    } else if (isIncludeDashAtEnd(txt)) {
      txt = fixALWithDash(txt);
    }
    txt = capitalizeFirstLetter(txt);
  }
  return txt;
}

function applyArabicHarakatTransliteration(txt) {
  if (txt) {
    txt = fixAlDashAndBracket(txt);
    txt = fixBrillChar(txt);
    // if (isIncludeBracket(txt) && txt.toLowerCase().includes('al-')) {
    //     let dashesBrackets = txt.split('(');
    //     let joinedStr = "";
    //     dashesBrackets.forEach(element => {
    //         if (element.includes(')'))
    //             joinedStr += fixALWithDashBetweenBrackets(element) + " ";
    //         else
    //             joinedStr += fixALWithDash(element) + " ";
    //     });
    //     txt = joinedStr.trim();
    // } else if (isIncludeDashAtEnd(txt)) {
    //     txt = fixALWithDash(txt);
    // }

    let result = '';
    let txts = txt.split(' ');
    txts.forEach((element) => {
      result += transliterationToArabicHarakat(element) + ' ';
    });
    txt = result.trim();
  }
  return txt;
}

function transliterationToArabicHarakat(txt) {
  if (txt) {
    txt = txt.trim();
    let hasLeftBrackets = txt.startsWith('(');
    let hasRightBrackets = txt.endsWith(')');
    let hasComma = txt.endsWith(',');

    if (hasComma) {
      txt = txt.replaceAll(',', '');
    }

    if (hasLeftBrackets) {
      txt = txt.replaceAll('(', '');
    }

    if (hasRightBrackets) {
      txt = txt.replaceAll(')', '');
    }

    /*
     * Common words
     */
    txt = txt.replaceAll(/ʿAbdallāh/gi, 'عَبْد اللَّه');
    txt = txt.replaceAll(/Hibatallāh/gi, 'هِبَة اللَّه');
    txt = txt.replaceAll(/\bYuḥannā\b/gi, 'يُحَنَّا');
    txt = txt.replaceAll(/\bḤannā\b/gi, 'حَنَّا');
    txt = txt.replaceAll(/ʿAbda/gi, 'عَبْدَة');
    txt = txt.replaceAll(/ʿUbayd/gi, 'عُبَيْد');
    txt = txt.replaceAll(/\bʿAbd\b/gi, 'عَبْد');
    txt = txt.replaceAll(/\bAbū\b/gi, 'أَبُو');
    txt = txt.replaceAll(/\bAbu\b/gi, 'أَبُو');
    txt = txt.replaceAll(/\bahl\b/gi, 'أَهْل');
    txt = txt.replaceAll(/allāh/gi, 'اللَّه');
    txt = txt.replaceAll(/llāh/gi, 'لِلْه');
    txt = txt.replaceAll(/\bBint\b/g, 'بِنْت');
    txt = txt.replaceAll(/\bIbn\b/g, 'ابْن');
    txt = txt.replaceAll(/\bLaysa\b/gi, 'لَيْسَ');
    txt = txt.replaceAll(/\bKhalaṭa\b/gi, 'خَلَطَ');
    txt = txt.replaceAll(/\bCopt\b/gi, 'قِبْطِي');
    txt = txt.replaceAll(/\bCooton\b/gi, 'قُطُن');
    txt = txt.replaceAll('bt.', 'بِنْت'); //bt.
    txt = txt.replaceAll('b.', 'بِن'); //b.
    txt = txt.replaceAll('Ṣ.', 'صَاحِب'); //b.
    txt = txt.replaceAll(/al- /gi, 'ال');
    txt = txt.replaceAll(/al-/gi, 'ال');

    /**
     * Hamza
     */
    txt = txt.replaceAll(/aʾū/gi, 'aؤُū');
    txt = txt.replaceAll(/uʾa/gi, 'uؤَ');
    txt = txt.replaceAll(/aʾ/gi, 'aأ');
    txt = txt.replaceAll(/uʾ/gi, 'uؤْ');
    txt = txt.replaceAll(/iʾ$/gi, 'iئ');
    txt = txt.replaceAll(/āʾa$/gi, 'āءة');

    txt = txt.replaceAll(/ʾa$/gi, 'ئة');
    txt = txt.replaceAll(/ʾa/gi, 'أَ');
    txt = txt.replaceAll(/ʾu/gi, 'أُ');
    txt = txt.replaceAll(/ʾi/gi, 'ئِ');

    /**
     * Shada Two Letter
     */
    txt = txt.replaceAll(/ūwūwā/gi, 'وَّا');
    txt = txt.replaceAll(/ūwūwū/gi, 'وُّو');
    txt = txt.replaceAll(/ūwūwī/gi, 'وِّي');

    txt = txt.replaceAll(/ūwūwa$/gi, 'وَّة');
    txt = txt.replaceAll(/ūwūwa/gi, 'وَّ');
    txt = txt.replaceAll(/ūwūwu/gi, 'وُّ');
    txt = txt.replaceAll(/ūwūwi/gi, 'وِّ');
    txt = txt.replaceAll(/ūwūw/gi, 'وّ');

    txt = txt.replaceAll(/ththā/gi, 'ثَّا');
    txt = txt.replaceAll(/ththū/gi, 'ثُّو');
    txt = txt.replaceAll(/ththī/gi, 'ثِّي');

    txt = txt.replaceAll(/ththa$/gi, 'ثَّة');
    txt = txt.replaceAll(/ththa/gi, 'ثَّ');
    txt = txt.replaceAll(/ththu/gi, 'ثُّ');
    txt = txt.replaceAll(/ththi/gi, 'ثِّ');
    txt = txt.replaceAll(/thth/gi, 'ثّ');

    txt = txt.replaceAll(/djdjā/gi, 'جَّا');
    txt = txt.replaceAll(/djdjū/gi, 'جُّو');
    txt = txt.replaceAll(/djdjī/gi, 'جِّي');

    txt = txt.replaceAll(/djdja$/gi, 'جَّة');
    txt = txt.replaceAll(/djdja/gi, 'جَّ');
    txt = txt.replaceAll(/djdju/gi, 'جُّ');
    txt = txt.replaceAll(/djdji/gi, 'جِّ');
    txt = txt.replaceAll(/djdj/gi, 'جّ');

    txt = txt.replaceAll(/dhdhā/gi, 'ذَّا');
    txt = txt.replaceAll(/dhdhū/gi, 'ذُّو');
    txt = txt.replaceAll(/dhdhī/gi, 'ذِّي');

    txt = txt.replaceAll(/dhdha$/gi, 'ذَّة');
    txt = txt.replaceAll(/dhdha/gi, 'ذَّ');
    txt = txt.replaceAll(/dhdhu/gi, 'ذُّ');
    txt = txt.replaceAll(/dhdhi/gi, 'ذِّ');
    txt = txt.replaceAll(/dhdh/gi, 'ذّ');

    txt = txt.replaceAll(/khkhā/gi, 'خَّا');
    txt = txt.replaceAll(/khkhū/gi, 'خُّو');
    txt = txt.replaceAll(/khkhī/gi, 'خِّي');

    txt = txt.replaceAll(/khkha$/gi, 'خَّة');
    txt = txt.replaceAll(/khkha/gi, 'خَّ');
    txt = txt.replaceAll(/khkhu/gi, 'خُّ');
    txt = txt.replaceAll(/khkhi/gi, 'خِّ');
    txt = txt.replaceAll(/khkh/gi, 'خّ');

    txt = txt.replaceAll(/shshā/gi, 'شَّا');
    txt = txt.replaceAll(/shshū/gi, 'شُّو');
    txt = txt.replaceAll(/shshī/gi, 'شِّي');

    txt = txt.replaceAll(/shsha$/gi, 'شَّة');
    txt = txt.replaceAll(/shsha/gi, 'شَّ');
    txt = txt.replaceAll(/shshu/gi, 'شُّ');
    txt = txt.replaceAll(/shshi/gi, 'شِّ');
    txt = txt.replaceAll(/shsh/gi, 'شّ');

    txt = txt.replaceAll(/chchā/gi, 'شَّا');
    txt = txt.replaceAll(/chchū/gi, 'شُّو');
    txt = txt.replaceAll(/chchī/gi, 'شِّي');

    txt = txt.replaceAll(/chcha$/gi, 'شَّة');
    txt = txt.replaceAll(/chcha/gi, 'شَّ');
    txt = txt.replaceAll(/chchu/gi, 'شُّ');
    txt = txt.replaceAll(/chchi/gi, 'شِّ');
    txt = txt.replaceAll(/chch/gi, 'شّ');

    txt = txt.replaceAll(/ghghā/gi, 'غَّا');
    txt = txt.replaceAll(/ghghū/gi, 'غُّو');
    txt = txt.replaceAll(/ghghī/gi, 'غِّي');

    txt = txt.replaceAll(/ghgha$/gi, 'غَّة');
    txt = txt.replaceAll(/ghgha/gi, 'غَّ');
    txt = txt.replaceAll(/ghghu/gi, 'غُّ');
    txt = txt.replaceAll(/ghghi/gi, 'غِّ');
    txt = txt.replaceAll(/ghgh/gi, 'غّ');

    /**
     * Tow letters
     */
    txt = txt.replaceAll(/thā/gi, 'ثَا');
    txt = txt.replaceAll(/thū/gi, 'ثُو');
    txt = txt.replaceAll(/thī/gi, 'ثِيْ');

    txt = txt.replaceAll(/tha$/gi, 'ثَة');
    txt = txt.replaceAll(/tha/gi, 'ثَ');
    txt = txt.replaceAll(/thu/gi, 'ثُ');
    txt = txt.replaceAll(/thi/gi, 'ثِ');
    txt = txt.replaceAll(/th/gi, 'ثْ');
    txt = txt.replace(/ثْ$/gi, 'ث');

    txt = txt.replaceAll(/dhā/gi, 'ذَا');
    txt = txt.replaceAll(/dhū/gi, 'ذُو');
    txt = txt.replaceAll(/dhī/gi, 'ذِيْ');

    txt = txt.replaceAll(/dha$/gi, 'ذَة');
    txt = txt.replaceAll(/dha/gi, 'ذَ');
    txt = txt.replaceAll(/dhu/gi, 'ذُ');
    txt = txt.replaceAll(/dhi/gi, 'ذِ');
    txt = txt.replaceAll(/dh/gi, 'ذْ');
    txt = txt.replace(/ذْ$/gi, 'ذ');

    txt = txt.replaceAll(/khā/gi, 'خَا');
    txt = txt.replaceAll(/khū/gi, 'خُو');
    txt = txt.replaceAll(/khī/gi, 'خِيْ');

    txt = txt.replaceAll(/kha$/gi, 'خَة');
    txt = txt.replaceAll(/kha/gi, 'خَ');
    txt = txt.replaceAll(/khu/gi, 'خُ');
    txt = txt.replaceAll(/khi/gi, 'خِ');
    txt = txt.replaceAll(/kh/gi, 'خْ');
    txt = txt.replace(/خْ$/gi, 'خ');

    txt = txt.replaceAll(/ḫā/gi, 'خَا');
    txt = txt.replaceAll(/ḫū/gi, 'خُو');
    txt = txt.replaceAll(/ḫī/gi, 'خِيْ');

    txt = txt.replaceAll(/ḫa$/gi, 'خَة');
    txt = txt.replaceAll(/ḫa/gi, 'خَ');
    txt = txt.replaceAll(/ḫu/gi, 'خُ');
    txt = txt.replaceAll(/ḫi/gi, 'خِ');
    txt = txt.replaceAll(/ḫ/gi, 'خْ');
    txt = txt.replace(/خْ$/gi, 'خ');

    txt = txt.replaceAll(/shā/gi, 'شَا');
    txt = txt.replaceAll(/shū/gi, 'شُو');
    txt = txt.replaceAll(/shī/gi, 'شِيْ');

    txt = txt.replaceAll(/sha$/gi, 'شَة');
    txt = txt.replaceAll(/sha/gi, 'شَ');
    txt = txt.replaceAll(/shu/gi, 'شُ');
    txt = txt.replaceAll(/shi/gi, 'شِ');
    txt = txt.replaceAll(/sh/gi, 'شْ');
    txt = txt.replace(/شْ$/gi, 'ش');

    txt = txt.replaceAll(/chā/gi, 'شَا');
    txt = txt.replaceAll(/chū/gi, 'شُو');
    txt = txt.replaceAll(/chī/gi, 'شِيْ');

    txt = txt.replaceAll(/cha$/gi, 'شَة');
    txt = txt.replaceAll(/cha/gi, 'شَ');
    txt = txt.replaceAll(/chu/gi, 'شُ');
    txt = txt.replaceAll(/chi/gi, 'شِ');
    txt = txt.replaceAll(/ch/gi, 'شْ');
    txt = txt.replace(/شْ$/gi, 'ش');

    txt = txt.replaceAll(/ghā/gi, 'غَا');
    txt = txt.replaceAll(/ghū/gi, 'غُو');
    txt = txt.replaceAll(/ghī/gi, 'غِيْ');

    txt = txt.replaceAll(/gha$/gi, 'غَة');
    txt = txt.replaceAll(/gha/gi, 'غَ');
    txt = txt.replaceAll(/ghu/gi, 'غُ');
    txt = txt.replaceAll(/ghi/gi, 'غِ');
    txt = txt.replaceAll(/gh/gi, 'غْ');
    txt = txt.replace(/غْ$/gi, 'غ');

    /**
     * Shada One Letter
     */
    // bb بّ
    txt = txt.replaceAll(/bbā/gi, 'بَّا');
    txt = txt.replaceAll(/bbū/gi, 'بُّو');
    txt = txt.replaceAll(/bbī/gi, 'بِّي');

    txt = txt.replaceAll(/bba$/gi, 'بَّة');
    txt = txt.replaceAll(/bba/gi, 'بَّ');
    txt = txt.replaceAll(/bbu/gi, 'بُّ');
    txt = txt.replaceAll(/bbi/gi, 'بِّ');
    txt = txt.replaceAll(/bb/gi, 'بّ');

    // tt ت
    txt = txt.replaceAll(/ttā/gi, 'تَّا');
    txt = txt.replaceAll(/ttū/gi, 'تُّو');
    txt = txt.replaceAll(/ttī/gi, 'تِّي');

    txt = txt.replaceAll(/tta$/gi, 'تَّة');
    txt = txt.replaceAll(/tta/gi, 'تَّ');
    txt = txt.replaceAll(/ttu/gi, 'تُّ');
    txt = txt.replaceAll(/tti/gi, 'تِّ');
    txt = txt.replaceAll(/tt/gi, 'تّ');

    // ḥḥ حّ
    txt = txt.replaceAll(/ḥḥā/gi, 'حَّا');
    txt = txt.replaceAll(/ḥḥū/gi, 'حُّو');
    txt = txt.replaceAll(/ḥḥī/gi, 'حِّي');

    txt = txt.replaceAll(/ḥḥa$/gi, 'حَّة');
    txt = txt.replaceAll(/ḥḥa/gi, 'حَّ');
    txt = txt.replaceAll(/ḥḥu/gi, 'حُّ');
    txt = txt.replaceAll(/ḥḥi/gi, 'حِّ');
    txt = txt.replaceAll(/ḥḥ/gi, 'حّ');

    // dd دّ
    txt = txt.replaceAll(/ddā/gi, 'دَّا');
    txt = txt.replaceAll(/ddū/gi, 'دُّو');
    txt = txt.replaceAll(/ddī/gi, 'دِّي');

    txt = txt.replaceAll(/dda$/gi, 'دَّة');
    txt = txt.replaceAll(/dda/gi, 'دَّ');
    txt = txt.replaceAll(/ddu/gi, 'دُّ');
    txt = txt.replaceAll(/ddi/gi, 'دِّ');
    txt = txt.replaceAll(/dd/gi, 'دّ');

    txt = txt.replaceAll(/rrā/gi, 'رَّا');
    txt = txt.replaceAll(/rrū/gi, 'رُّو');
    txt = txt.replaceAll(/rrī/gi, 'رِّي');

    txt = txt.replaceAll(/rra$/gi, 'رَّة');
    txt = txt.replaceAll(/rra/gi, 'رَّ');
    txt = txt.replaceAll(/rru/gi, 'رُّ');
    txt = txt.replaceAll(/rri/gi, 'رِّ');
    txt = txt.replaceAll(/rr/gi, 'رّ');

    txt = txt.replaceAll(/zzā/gi, 'زَّا');
    txt = txt.replaceAll(/zzū/gi, 'زُّو');
    txt = txt.replaceAll(/zzī/gi, 'زِّي');

    txt = txt.replaceAll(/zza$/gi, 'زَّة');
    txt = txt.replaceAll(/zza/gi, 'زَّ');
    txt = txt.replaceAll(/zzu/gi, 'زُّ');
    txt = txt.replaceAll(/zzi/gi, 'زِّ');
    txt = txt.replaceAll(/zz/gi, 'زّ');

    txt = txt.replaceAll(/ssā/gi, 'سَّا');
    txt = txt.replaceAll(/ssū/gi, 'سُّو');
    txt = txt.replaceAll(/ssī/gi, 'سِّي');

    txt = txt.replaceAll(/ssa$/gi, 'سَّة');
    txt = txt.replaceAll(/ssa/gi, 'سَّ');
    txt = txt.replaceAll(/ssu/gi, 'سُّ');
    txt = txt.replaceAll(/ssi/gi, 'سِّ');
    txt = txt.replaceAll(/ss/gi, 'سّ');

    txt = txt.replaceAll(/ṣṣā/gi, 'صَّا');
    txt = txt.replaceAll(/ṣṣū/gi, 'صُّو');
    txt = txt.replaceAll(/ṣṣī/gi, 'صِّي');

    txt = txt.replaceAll(/ṣṣa$/gi, 'صَّة');
    txt = txt.replaceAll(/ṣṣa/gi, 'صَّ');
    txt = txt.replaceAll(/ṣṣu/gi, 'صُّ');
    txt = txt.replaceAll(/ṣṣi/gi, 'صِّ');
    txt = txt.replaceAll(/ṣṣ/gi, 'صّ');

    txt = txt.replaceAll(/ḍḍā/gi, 'ضَّا');
    txt = txt.replaceAll(/ḍḍū/gi, 'ضُّو');
    txt = txt.replaceAll(/ḍḍī/gi, 'ضِّي');

    txt = txt.replaceAll(/ḍḍa$/gi, 'ضَّة');
    txt = txt.replaceAll(/ḍḍa/gi, 'ضَّ');
    txt = txt.replaceAll(/ḍḍu/gi, 'ضُّ');
    txt = txt.replaceAll(/ḍḍi/gi, 'ضِّ');
    txt = txt.replaceAll(/ḍḍ/gi, 'ضّ');

    txt = txt.replaceAll(/ṭṭā/gi, 'طَّا');
    txt = txt.replaceAll(/ṭṭū/gi, 'طُّو');
    txt = txt.replaceAll(/ṭṭī/gi, 'طِّي');

    txt = txt.replaceAll(/ṭṭa$/gi, 'طَّة');
    txt = txt.replaceAll(/ṭṭa/gi, 'طَّ');
    txt = txt.replaceAll(/ṭṭu/gi, 'طُّ');
    txt = txt.replaceAll(/ṭṭi/gi, 'طِّ');
    txt = txt.replaceAll(/ṭṭ/gi, 'طّ');

    txt = txt.replaceAll(/ẓẓā/gi, 'ظَّا');
    txt = txt.replaceAll(/ẓẓū/gi, 'ظُّو');
    txt = txt.replaceAll(/ẓẓī/gi, 'ظِّي');

    txt = txt.replaceAll(/ẓẓa$/gi, 'ظَّة');
    txt = txt.replaceAll(/ẓẓa/gi, 'ظَّ');
    txt = txt.replaceAll(/ẓẓu/gi, 'ظُّ');
    txt = txt.replaceAll(/ẓẓi/gi, 'ظِّ');
    txt = txt.replaceAll(/ẓẓ/gi, 'ظّ');

    txt = txt.replaceAll(/ʿʿā/gi, 'عَّا');
    txt = txt.replaceAll(/ʿʿū/gi, 'عُّو');
    txt = txt.replaceAll(/ʿʿī/gi, 'عِّي');

    txt = txt.replaceAll(/ʿʿa$/gi, 'عَّة');
    txt = txt.replaceAll(/ʿʿa/gi, 'عَّ');
    txt = txt.replaceAll(/ʿʿu/gi, 'عُّ');
    txt = txt.replaceAll(/ʿʿi/gi, 'عِّ');
    txt = txt.replaceAll(/ʿʿ/gi, 'عّ');

    txt = txt.replaceAll(/ffā/gi, 'فَّا');
    txt = txt.replaceAll(/ffū/gi, 'فُّو');
    txt = txt.replaceAll(/ffī/gi, 'فِّي');

    txt = txt.replaceAll(/ffa$/gi, 'فَّة');
    txt = txt.replaceAll(/ffa/gi, 'فَّ');
    txt = txt.replaceAll(/ffu/gi, 'فُّ');
    txt = txt.replaceAll(/ffi/gi, 'فِّ');
    txt = txt.replaceAll(/ff/gi, 'فّ');

    txt = txt.replaceAll(/qqā/gi, 'قَّا');
    txt = txt.replaceAll(/qqū/gi, 'قُّو');
    txt = txt.replaceAll(/qqī/gi, 'قِّي');

    txt = txt.replaceAll(/qqa$/gi, 'قَّة');
    txt = txt.replaceAll(/qqa/gi, 'قَّ');
    txt = txt.replaceAll(/qqu/gi, 'قُّ');
    txt = txt.replaceAll(/qqi/gi, 'قِّ');
    txt = txt.replaceAll(/qq/gi, 'قّ');

    txt = txt.replaceAll(/kkā/gi, 'كَّا');
    txt = txt.replaceAll(/kkū/gi, 'كُّو');
    txt = txt.replaceAll(/kkī/gi, 'كِّي');

    txt = txt.replaceAll(/kka$/gi, 'كَّة');
    txt = txt.replaceAll(/kka/gi, 'كَّ');
    txt = txt.replaceAll(/kku/gi, 'كُّ');
    txt = txt.replaceAll(/kki/gi, 'كِّ');
    txt = txt.replaceAll(/kk/gi, 'كّ');

    txt = txt.replaceAll(/llā/gi, 'لَّا');
    txt = txt.replaceAll(/llū/gi, 'لُّو');
    txt = txt.replaceAll(/llī/gi, 'لِّي');

    txt = txt.replaceAll(/lla$/gi, 'لَّة');
    txt = txt.replaceAll(/lla/gi, 'لَّ');
    txt = txt.replaceAll(/llu/gi, 'لُّ');
    txt = txt.replaceAll(/lli/gi, 'لِّ');
    txt = txt.replaceAll(/ll/gi, 'لّ');

    txt = txt.replaceAll(/mmā/gi, 'مَّا');
    txt = txt.replaceAll(/mmū/gi, 'مُّو');
    txt = txt.replaceAll(/mmī/gi, 'مِّي');

    txt = txt.replaceAll(/mma$/gi, 'مَّة');
    txt = txt.replaceAll(/mma/gi, 'مَّ');
    txt = txt.replaceAll(/mmu/gi, 'مُّ');
    txt = txt.replaceAll(/mmi/gi, 'مِّ');
    txt = txt.replaceAll(/mm/gi, 'مّ');

    txt = txt.replaceAll(/nnā/gi, 'نَّا');
    txt = txt.replaceAll(/nnū/gi, 'نُّو');
    txt = txt.replaceAll(/nnī/gi, 'نِّي');

    txt = txt.replaceAll(/nna$/gi, 'نَّة');
    txt = txt.replaceAll(/nna/gi, 'نَّ');
    txt = txt.replaceAll(/nnu/gi, 'نُّ');
    txt = txt.replaceAll(/nni/gi, 'نِّ');
    txt = txt.replaceAll(/nn/gi, 'نّ');

    txt = txt.replaceAll(/hhā/gi, 'هَّا');
    txt = txt.replaceAll(/hhū/gi, 'هُّو');
    txt = txt.replaceAll(/hhī/gi, 'هِّي');

    txt = txt.replaceAll(/hha$/gi, 'هَّة');
    txt = txt.replaceAll(/hha/gi, 'هَّ');
    txt = txt.replaceAll(/hhu/gi, 'هُّ');
    txt = txt.replaceAll(/hhi/gi, 'هِّ');
    txt = txt.replaceAll(/hh/gi, 'هّ');

    txt = txt.replaceAll(/wwā/gi, 'وَّا');
    txt = txt.replaceAll(/wwū/gi, 'وُّو');
    txt = txt.replaceAll(/wwī/gi, 'وِّي');

    txt = txt.replaceAll(/wwa$/gi, 'وَّة');
    txt = txt.replaceAll(/wwa/gi, 'وَّ');
    txt = txt.replaceAll(/wwu/gi, 'وُّ');
    txt = txt.replaceAll(/wwi/gi, 'وِّ');
    txt = txt.replaceAll(/ww/gi, 'وّ');

    txt = txt.replaceAll(/ūūā/gi, 'وَّا');
    txt = txt.replaceAll(/ūūū/gi, 'وُّو');
    txt = txt.replaceAll(/ūūī/gi, 'وِّي');

    txt = txt.replaceAll(/ūūa$/gi, 'وَّة');
    txt = txt.replaceAll(/ūūa/gi, 'وَّ');
    txt = txt.replaceAll(/ūūu/gi, 'وُّ');
    txt = txt.replaceAll(/ūūi/gi, 'وِّ');
    txt = txt.replaceAll(/ūū/gi, 'وّ');

    txt = txt.replaceAll(/yyā/gi, 'يَّا');
    txt = txt.replaceAll(/yyū/gi, 'يُّو');
    txt = txt.replaceAll(/yyī/gi, 'يِّي');

    txt = txt.replaceAll(/yya$/gi, 'يَّة');
    txt = txt.replaceAll(/yya/gi, 'يَّ');
    txt = txt.replaceAll(/yyu/gi, 'يُّ');
    txt = txt.replaceAll(/yyi/gi, 'يِّ');
    txt = txt.replaceAll(/yy/gi, 'يّ');

    txt = txt.replaceAll(/īīā/gi, 'يَّا');
    txt = txt.replaceAll(/īīū/gi, 'يُّو');
    txt = txt.replaceAll(/īīī/gi, 'يِّي');

    txt = txt.replaceAll(/īīa$/gi, 'يَّة');
    txt = txt.replaceAll(/īīa/gi, 'يَّ');
    txt = txt.replaceAll(/īīu/gi, 'يُّ');
    txt = txt.replaceAll(/īīi/gi, 'يِّ');
    txt = txt.replaceAll(/īī/gi, 'يّ');

    txt = txt.replaceAll(/ǧǧā/gi, 'جَّا');
    txt = txt.replaceAll(/ǧǧū/gi, 'جُّو');
    txt = txt.replaceAll(/ǧǧī/gi, 'جِّي');

    txt = txt.replaceAll(/ǧǧa$/gi, 'جَّة');
    txt = txt.replaceAll(/ǧǧa/gi, 'جَّ');
    txt = txt.replaceAll(/ǧǧu/gi, 'جُّ');
    txt = txt.replaceAll(/ǧǧi/gi, 'جِّ');
    txt = txt.replaceAll(/ǧǧ/gi, 'جّ');

    txt = txt.replaceAll(/jjā/gi, 'جَّا');
    txt = txt.replaceAll(/jjū/gi, 'جُّو');
    txt = txt.replaceAll(/jjī/gi, 'جِّي');

    txt = txt.replaceAll(/jja$/gi, 'جَّة');
    txt = txt.replaceAll(/jja/gi, 'جَّ');
    txt = txt.replaceAll(/jju/gi, 'جُّ');
    txt = txt.replaceAll(/jji/gi, 'جِّ');
    txt = txt.replaceAll(/jj/gi, 'جّ');

    txt = txt.replaceAll(/ḫḫā/gi, 'خَّا');
    txt = txt.replaceAll(/ḫḫū/gi, 'خُّو');
    txt = txt.replaceAll(/ḫḫī/gi, 'خِّي');

    txt = txt.replaceAll(/ḫḫa$/gi, 'خَّة');
    txt = txt.replaceAll(/ḫḫa/gi, 'خَّ');
    txt = txt.replaceAll(/ḫḫu/gi, 'خُّ');
    txt = txt.replaceAll(/ḫḫi/gi, 'خِّ');
    txt = txt.replaceAll(/ḫḫ/gi, 'خّ');

    txt = txt.replaceAll(/ššā/gi, 'شَّا');
    txt = txt.replaceAll(/ššū/gi, 'شُّو');
    txt = txt.replaceAll(/ššī/gi, 'شِّي');

    txt = txt.replaceAll(/šša$/gi, 'شَّة');
    txt = txt.replaceAll(/šša/gi, 'شَّ');
    txt = txt.replaceAll(/ššu/gi, 'شُّ');
    txt = txt.replaceAll(/šši/gi, 'شِّ');
    txt = txt.replaceAll(/šš/gi, 'شّ');

    txt = txt.replaceAll(/ġġā/gi, 'غَّا');
    txt = txt.replaceAll(/ġġū/gi, 'غُّو');
    txt = txt.replaceAll(/ġġī/gi, 'غِّي');

    txt = txt.replaceAll(/ġġa$/gi, 'غَّة');
    txt = txt.replaceAll(/ġġa/gi, 'غَّ');
    txt = txt.replaceAll(/ġġu/gi, 'غُّ');
    txt = txt.replaceAll(/ġġi/gi, 'غِّ');
    txt = txt.replaceAll(/ġġ/gi, 'غّ');

    // One Letter
    txt = txt.replaceAll(/bā/gi, 'بَا');
    txt = txt.replaceAll(/bū/gi, 'بُو');
    txt = txt.replaceAll(/bī/gi, 'بِيْ');

    txt = txt.replaceAll(/ba$/gi, 'بَة');
    txt = txt.replaceAll(/ba/gi, 'بَ');
    txt = txt.replaceAll(/bu/gi, 'بُ');
    txt = txt.replaceAll(/bi/gi, 'بِ');
    txt = txt.replaceAll(/b/gi, 'بْ');
    txt = txt.replace(/بْ$/gi, 'ب');

    txt = txt.replaceAll(/tā/gi, 'تَا');
    txt = txt.replaceAll(/tū/gi, 'تُو');
    txt = txt.replaceAll(/tī/gi, 'تِيْ');

    txt = txt.replaceAll(/ta$/gi, 'تَة');
    txt = txt.replaceAll(/ta/gi, 'تَ');
    txt = txt.replaceAll(/tu/gi, 'تُ');
    txt = txt.replaceAll(/ti/gi, 'تِ');
    txt = txt.replaceAll(/t/gi, 'تْ');
    txt = txt.replace(/تْ$/gi, 'ت');

    txt = txt.replaceAll(/ḥā/gi, 'حَا');
    txt = txt.replaceAll(/ḥū/gi, 'حُو');
    txt = txt.replaceAll(/ḥī/gi, 'حِيْ');

    txt = txt.replaceAll(/ḥa$/gi, 'حَة');
    txt = txt.replaceAll(/ḥa/gi, 'حَ');
    txt = txt.replaceAll(/ḥu/gi, 'حُ');
    txt = txt.replaceAll(/ḥi/gi, 'حِ');
    txt = txt.replaceAll(/ḥ/gi, 'حْ');
    txt = txt.replace(/حْ$/gi, 'ح');

    txt = txt.replaceAll(/jā/gi, 'جَا');
    txt = txt.replaceAll(/jū/gi, 'جُو');
    txt = txt.replaceAll(/jī/gi, 'جِيْ');

    txt = txt.replaceAll(/ja$/gi, 'جَة');
    txt = txt.replaceAll(/ja/gi, 'جَ');
    txt = txt.replaceAll(/ju/gi, 'جُ');
    txt = txt.replaceAll(/ji/gi, 'جِ');
    txt = txt.replaceAll(/j/gi, 'جْ');
    txt = txt.replace(/جْ$/gi, 'ج');

    txt = txt.replaceAll(/dā/gi, 'دَا');
    txt = txt.replaceAll(/dū/gi, 'دُو');
    txt = txt.replaceAll(/dī/gi, 'دِيْ');

    txt = txt.replaceAll(/da$/gi, 'دَة');
    txt = txt.replaceAll(/da/gi, 'دَ');
    txt = txt.replaceAll(/du/gi, 'دُ');
    txt = txt.replaceAll(/di/gi, 'دِ');
    txt = txt.replaceAll(/d/gi, 'دْ');
    txt = txt.replace(/دْ$/gi, 'د');

    txt = txt.replaceAll(/rā/gi, 'رَا');
    txt = txt.replaceAll(/rū/gi, 'رُو');
    txt = txt.replaceAll(/rī/gi, 'رِيْ');

    txt = txt.replaceAll(/ra$/gi, 'رَة');
    txt = txt.replaceAll(/ra/gi, 'رَ');
    txt = txt.replaceAll(/ru/gi, 'رُ');
    txt = txt.replaceAll(/ri/gi, 'رِ');
    txt = txt.replaceAll(/r/gi, 'رْ');
    txt = txt.replace(/رْ$/gi, 'ر');

    txt = txt.replaceAll(/zā/gi, 'زَا');
    txt = txt.replaceAll(/zū/gi, 'زُو');
    txt = txt.replaceAll(/zī/gi, 'زِيْ');

    txt = txt.replaceAll(/za$/gi, 'زَة');
    txt = txt.replaceAll(/za/gi, 'زَ');
    txt = txt.replaceAll(/zu/gi, 'زُ');
    txt = txt.replaceAll(/zi/gi, 'زِ');
    txt = txt.replaceAll(/z/gi, 'زْ');
    txt = txt.replace(/زْ$/gi, 'ز');

    txt = txt.replaceAll(/sā/gi, 'سَا');
    txt = txt.replaceAll(/sū/gi, 'سُو');
    txt = txt.replaceAll(/sī/gi, 'سِيْ');

    txt = txt.replaceAll(/sa$/gi, 'سَة');
    txt = txt.replaceAll(/sa/gi, 'سَ');
    txt = txt.replaceAll(/su/gi, 'سُ');
    txt = txt.replaceAll(/si/gi, 'سِ');
    txt = txt.replaceAll(/s/gi, 'سْ');
    txt = txt.replace(/سْ$/gi, 'س');

    txt = txt.replaceAll(/ṣā/gi, 'صَا');
    txt = txt.replaceAll(/ṣū/gi, 'صُو');
    txt = txt.replaceAll(/ṣī/gi, 'صِيْ');

    txt = txt.replaceAll(/ṣa$/gi, 'صَة');
    txt = txt.replaceAll(/ṣa/gi, 'صَ');
    txt = txt.replaceAll(/ṣu/gi, 'صُ');
    txt = txt.replaceAll(/ṣi/gi, 'صِ');
    txt = txt.replaceAll(/ṣ/gi, 'صْ');
    txt = txt.replace(/صْ$/gi, 'ص');

    txt = txt.replaceAll(/ḍā/gi, 'ضَا');
    txt = txt.replaceAll(/ḍū/gi, 'ضُو');
    txt = txt.replaceAll(/ḍī/gi, 'ضِيْ');

    txt = txt.replaceAll(/ḍa$/gi, 'ضَة');
    txt = txt.replaceAll(/ḍa/gi, 'ضَ');
    txt = txt.replaceAll(/ḍu/gi, 'ضُ');
    txt = txt.replaceAll(/ḍi/gi, 'ضِ');
    txt = txt.replaceAll(/ḍ/gi, 'ضْ');
    txt = txt.replace(/ضْ$/gi, 'ض');

    txt = txt.replaceAll(/ṭā/gi, 'طَا');
    txt = txt.replaceAll(/ṭū/gi, 'طُو');
    txt = txt.replaceAll(/ṭī/gi, 'طِيْ');

    txt = txt.replaceAll(/ṭa$/gi, 'طَة');
    txt = txt.replaceAll(/ṭa/gi, 'طَ');
    txt = txt.replaceAll(/ṭu/gi, 'طُ');
    txt = txt.replaceAll(/ṭi/gi, 'طِ');
    txt = txt.replaceAll(/ṭ/gi, 'طْ');
    txt = txt.replace(/طْ$/gi, 'ط');

    txt = txt.replaceAll(/ẓā/gi, 'ظَا');
    txt = txt.replaceAll(/ẓū/gi, 'ظُو');
    txt = txt.replaceAll(/ẓī/gi, 'ظِيْ');

    txt = txt.replaceAll(/ẓa$/gi, 'ظَة');
    txt = txt.replaceAll(/ẓa/gi, 'ظَ');
    txt = txt.replaceAll(/ẓu/gi, 'ظُ');
    txt = txt.replaceAll(/ẓi/gi, 'ظِ');
    txt = txt.replaceAll(/ẓ/gi, 'ظْ');
    txt = txt.replace(/ظْ$/gi, 'ظ');

    txt = txt.replaceAll(/ʿā/gi, 'عَا');
    txt = txt.replaceAll(/ʿū/gi, 'عُو');
    txt = txt.replaceAll(/ʿī/gi, 'عِيْ');

    txt = txt.replaceAll(/ʿa$/gi, 'عَة');
    txt = txt.replaceAll(/ʿa/gi, 'عَ');
    txt = txt.replaceAll(/ʿu/gi, 'عُ');
    txt = txt.replaceAll(/ʿi/gi, 'عِ');
    txt = txt.replaceAll(/ʿ/gi, 'عْ');
    txt = txt.replace(/عْ$/gi, 'ع');

    txt = txt.replaceAll(/fā/gi, 'فَا');
    txt = txt.replaceAll(/fū/gi, 'فُو');
    txt = txt.replaceAll(/fī/gi, 'فِيْ');

    txt = txt.replaceAll(/fa$/gi, 'فَة');
    txt = txt.replaceAll(/fa/gi, 'فَ');
    txt = txt.replaceAll(/fu/gi, 'فُ');
    txt = txt.replaceAll(/fi/gi, 'فِ');
    txt = txt.replaceAll(/f/gi, 'فْ');
    txt = txt.replace(/فْ$/gi, 'ف');

    txt = txt.replaceAll(/qā/gi, 'قَا');
    txt = txt.replaceAll(/qū/gi, 'قُو');
    txt = txt.replaceAll(/qī/gi, 'قِيْ');

    txt = txt.replaceAll(/qa$/gi, 'قَة');
    txt = txt.replaceAll(/qa/gi, 'قَ');
    txt = txt.replaceAll(/qu/gi, 'قُ');
    txt = txt.replaceAll(/qi/gi, 'قِ');
    txt = txt.replaceAll(/q/gi, 'قْ');
    txt = txt.replace(/قْ$/gi, 'ق');

    txt = txt.replaceAll(/kā/gi, 'كَا');
    txt = txt.replaceAll(/kū/gi, 'كُو');
    txt = txt.replaceAll(/kī/gi, 'كِيْ');

    txt = txt.replaceAll(/ka$/gi, 'كَة');
    txt = txt.replaceAll(/ka/gi, 'كَ');
    txt = txt.replaceAll(/ku/gi, 'كُ');
    txt = txt.replaceAll(/ki/gi, 'كِ');
    txt = txt.replaceAll(/k/gi, 'كْ');
    txt = txt.replace(/كْ$/gi, 'ك');

    txt = txt.replaceAll(/lā/gi, 'لَا');
    txt = txt.replaceAll(/lū/gi, 'لُو');
    txt = txt.replaceAll(/lī/gi, 'لِيْ');

    txt = txt.replaceAll(/la$/gi, 'لَة');
    txt = txt.replaceAll(/la/gi, 'لَ');
    txt = txt.replaceAll(/lu/gi, 'لُ');
    txt = txt.replaceAll(/li/gi, 'لِ');
    txt = txt.replaceAll(/l/gi, 'لْ');
    txt = txt.replace(/لْ$/gi, 'ل');

    txt = txt.replaceAll(/mā/gi, 'مَا');
    txt = txt.replaceAll(/mū/gi, 'مُو');
    txt = txt.replaceAll(/mī/gi, 'مِيْ');

    txt = txt.replaceAll(/ma$/gi, 'مَة');
    txt = txt.replaceAll(/ma/gi, 'مَ');
    txt = txt.replaceAll(/mu/gi, 'مُ');
    txt = txt.replaceAll(/mi/gi, 'مِ');
    txt = txt.replaceAll(/m/gi, 'مْ');
    txt = txt.replace(/مْ$/gi, 'م');

    txt = txt.replaceAll(/nā/gi, 'نَا');
    txt = txt.replaceAll(/nū/gi, 'نُو');
    txt = txt.replaceAll(/nī/gi, 'نِيْ');

    txt = txt.replaceAll(/na$/gi, 'نَة');
    txt = txt.replaceAll(/na/gi, 'نَ');
    txt = txt.replaceAll(/nu/gi, 'نُ');
    txt = txt.replaceAll(/ni/gi, 'نِ');
    txt = txt.replaceAll(/n/gi, 'نْ');
    txt = txt.replace(/نْ$/gi, 'ن');

    txt = txt.replaceAll(/hā/gi, 'هَا');
    txt = txt.replaceAll(/hū/gi, 'هُو');
    txt = txt.replaceAll(/hī/gi, 'هِيْ');

    txt = txt.replaceAll(/ha$/gi, 'هَة');
    txt = txt.replaceAll(/ha/gi, 'هَ');
    txt = txt.replaceAll(/hu/gi, 'هُ');
    txt = txt.replaceAll(/hi/gi, 'هِ');
    txt = txt.replaceAll(/h/gi, 'هْ');
    txt = txt.replace(/هْ$/gi, 'ه');

    // One letter
    txt = txt.replaceAll(/ūwa/gi, 'وَّ');
    txt = txt.replaceAll(/ūwu/gi, 'وُّ');
    txt = txt.replaceAll(/ūwi/gi, 'وِّ');

    txt = txt.replaceAll(/wā/gi, 'وَا');
    txt = txt.replaceAll(/wū/gi, 'وُو');
    txt = txt.replaceAll(/wī/gi, 'وِيْ');

    // txt = txt.replaceAll(/\bwa\b/gi, 'وَ');
    txt = txt.replaceAll(/wa$/gi, 'وَة');
    txt = txt.replaceAll(/wa/gi, 'وَ');
    txt = txt.replaceAll(/wu/gi, 'وُ');
    txt = txt.replaceAll(/wi/gi, 'وِ');
    txt = txt.replaceAll(/w/gi, 'وْ');
    txt = txt.replace(/وْ$/gi, 'و');

    txt = txt.replaceAll(/yā/gi, 'يَا');
    txt = txt.replaceAll(/yū/gi, 'يُو');
    txt = txt.replaceAll(/yī/gi, 'يِيْ');

    txt = txt.replaceAll(/ya$/gi, 'يَة');
    txt = txt.replaceAll(/ya/gi, 'يَ');
    txt = txt.replaceAll(/yu/gi, 'يُ');
    txt = txt.replaceAll(/yi/gi, 'يِ');
    txt = txt.replaceAll(/ʾy/gi, 'ئِيْ');
    txt = txt.replaceAll(/y/gi, 'يْ');
    txt = txt.replace(/يْ$/gi, 'ي');

    txt = txt.replaceAll(/īā/gi, 'يَا');
    txt = txt.replaceAll(/īū/gi, 'يُو');
    txt = txt.replaceAll(/īī/gi, 'يِيْ');

    txt = txt.replaceAll(/īa$/gi, 'يَة');
    txt = txt.replaceAll(/īa/gi, 'يَ');
    txt = txt.replaceAll(/īu/gi, 'يُ');
    txt = txt.replaceAll(/īi/gi, 'يِ');
    txt = txt.replaceAll(/ʾī/gi, 'ئِيْ');
    txt = txt.replaceAll(/ī/gi, 'يْ');
    txt = txt.replace(/يْ$/gi, 'ي');

    txt = txt.replaceAll(/ūā/gi, 'وَا');
    txt = txt.replaceAll(/ūū/gi, 'وُو');
    txt = txt.replaceAll(/ūī/gi, 'وِيْ');

    txt = txt.replaceAll(/ūa$/gi, 'وَة');
    txt = txt.replaceAll(/ūa/gi, 'وَ');
    txt = txt.replaceAll(/ūu/gi, 'وُ');
    txt = txt.replaceAll(/ūi/gi, 'وِ');
    txt = txt.replaceAll(/ʾū/gi, 'ؤُوْ');
    txt = txt.replaceAll(/ū/gi, 'وْ');
    txt = txt.replace(/وْ$/gi, 'و');

    /**
     * Hamza
     */
    //  txt = txt.replace(/([^\u0621-\u063A\u0641-\u064A\u0660-\u0669a-zA-Z 0-9])/g, '');

    // txt = txt.replaceAll(/َʾ/gi, 'ُا');
    // txt = txt.replaceAll(/ُʾ/gi, 'ُؤ');
    // txt = txt.replaceAll(/ِʾ/gi, 'ُؤ');
    // txt = txt.replaceAll(/uʾ/gi, 'uؤ');
    // txt = txt.replaceAll(/ʾā/gi, 'ا');
    // txt = txt.replaceAll(/ʾū/gi, 'ئُو');
    // txt = txt.replaceAll(/ʾī/gi, 'ئِي');
    // txt = txt.replaceAll(/ʾy/gi, 'ئِي');

    // txt = txt.replaceAll(/ʾa/gi, 'أَ');
    // txt = txt.replaceAll(/ʾu/gi, 'أُ');
    // txt = txt.replaceAll(/ʾi/gi, 'إِ');
    // txt = txt.replaceAll(/ʾā/gi, 'ا');
    txt = txt.replaceAll(/U/g, 'أُ');
    txt = txt.replaceAll(/ʾ/gi, 'ء');
    // if (txt.includes('a'))
    // console.log(txt);
    txt = txt.replaceAll(/a$/g, 'ة');

    // txt = txt.replaceAll(/a/g, '');
    // txt = txt.replaceAll(/i/g, '');
    // txt = txt.replaceAll(/u/g, '');
    // txt = txt.replaceAll(/e/g, '');

    txt = txt.replaceAll(/Ā/g, 'آ');
    txt = txt.replaceAll(/ā/g, 'ا');
    txt = txt.replaceAll(/A/gi, 'أَ');
    txt = txt.replaceAll(/I/g, 'إِ');

    txt = txt.replaceAll(/-/gi, ' ');

    /**
     * Shada
     */
    if (txt.startsWith('ال')) {
      txt = txt.replace(/التَ/i, 'التَّ');
      txt = txt.replace(/التُ/i, 'التُّ');
      txt = txt.replace(/التِ/i, 'التِّ');

      txt = txt.replace(/الثَ/i, 'الثَّ');
      txt = txt.replace(/الثُ/i, 'الثُّ');
      txt = txt.replace(/الثِ/i, 'الثِّ');

      txt = txt.replace(/الدَ/i, 'الدَّ');
      txt = txt.replace(/الدُ/i, 'الدُّ');
      txt = txt.replace(/الدِ/i, 'الدِّ');

      txt = txt.replace(/الذَ/i, 'الذَّ');
      txt = txt.replace(/الذُ/i, 'الذُّ');
      txt = txt.replace(/الذِ/i, 'الذِّ');

      txt = txt.replace(/الرَ/i, 'الرَّ');
      txt = txt.replace(/الرُ/i, 'الرُّ');
      txt = txt.replace(/الرِ/i, 'الرِّ');

      txt = txt.replace(/الزَ/i, 'الزَّ');
      txt = txt.replace(/الزُ/i, 'الزُّ');
      txt = txt.replace(/الزِ/i, 'الزِّ');

      txt = txt.replace(/السَ/i, 'السَّ');
      txt = txt.replace(/السُ/i, 'السُّ');
      txt = txt.replace(/السِ/i, 'السِّ');

      txt = txt.replace(/الشَ/i, 'الشَّ');
      txt = txt.replace(/الشُ/i, 'الشُّ');
      txt = txt.replace(/الشِ/i, 'الشِّ');

      txt = txt.replace(/الصَ/i, 'الصَّ');
      txt = txt.replace(/الصُ/i, 'الصُّ');
      txt = txt.replace(/الصِ/i, 'الصِّ');

      txt = txt.replace(/الضَ/i, 'الضَّ');
      txt = txt.replace(/الضُ/i, 'الضُّ');
      txt = txt.replace(/الضِ/i, 'الضِّ');

      txt = txt.replace(/الطَ/i, 'الطَّ');
      txt = txt.replace(/الطُ/i, 'الطُّ');
      txt = txt.replace(/الطِ/i, 'الطِّ');

      txt = txt.replace(/الظَ/i, 'الظَّ');
      txt = txt.replace(/الظُ/i, 'الظُّ');
      txt = txt.replace(/الظِ/i, 'الظِّ');

      txt = txt.replace(/اللَ/i, 'اللَّ');
      txt = txt.replace(/اللُ/i, 'اللُّ');
      txt = txt.replace(/اللِ/i, 'اللِّ');

      txt = txt.replace(/النَ/i, 'النَّ');
      txt = txt.replace(/النُ/i, 'النُّ');
      txt = txt.replace(/النِ/i, 'النِّ');
    }

    if (txt.length > 3 && !txt.endsWith('يَّا')) {
      txt = txt.replaceAll(/ا$/gi, 'ى');
    }

    if (hasLeftBrackets) {
      txt = '(' + txt;
    }

    if (hasRightBrackets) {
      txt = txt + ')';
    }

    if (hasComma) {
      txt = txt + ',';
    }
  }
  return txt;
}

export {
  replaceFilterNameOrder,
  fixBrillChar,
  transliterationToArabic,
  transliterationToArabicHarakat,
  applyArabicHarakatTransliteration,
  fixALWithDash,
  fixALWithDashBetweenBrackets,
  isIncludeBracket,
  isIncludeDashAtEnd,
  fixAlDashAndBracket,
  removeHarakat
};
