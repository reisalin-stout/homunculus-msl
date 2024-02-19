let astromonStorageContainerUpdateButton = null;
let astromonInventory = null;
let timerId = 0;
document.addEventListener("subpage-load", async function () {
  window.database = await fetch("database.json")
    .then((response) => {
      if (!response.ok) {
      }
      return response.json();
    })
    .then((data) => {
      astromonStorageContainerUpdateButton = document.getElementById(
        "update-astromon-storage-button"
      );

      astromonStorageContainerUpdateButton.classList.remove("is-loading");
      astromonStorageContainerUpdateButton.disabled = false;
      return data;
    })
    .catch((error) => {});

  appListener.receiver = (object) => {
    switch (object.type) {
      case "response":
        break;
    }
  };
  appListener.scriptResult = (data) => {
    switch (data.type) {
      case "astromon-inventory":
        astromonInventory = data.body.sort((a, b) => {
          if (a.total_atk_sort.value !== b.total_atk_sort.value) {
            return b.total_atk_sort.value - a.total_atk_sort.value; // Sort by total_atk in descending order
          } else {
            // If total_atk is the same, sort by 'element'
            return b.total_atk_sort.value - a.total_atk_sort.value; //return a.element.localeCompare(b.element);
          }
          /*public const MonsterStatType MsNone = 0;
	public const MonsterStatType MsAttack = 1;
	public const MonsterStatType MsDefence = 2;
	public const MonsterStatType MsHeal = 3;
	public const MonsterStatType MsBalance = 4;
	public const MonsterStatType MsHp = 5;
  
  public const MonsterStorageType MstUserInven = 0; // 0x0
	public const MonsterStorageType MstDefaultStorage1 = 1; // 0x0
	public const MonsterStorageType MstExtendStorage2 = 2; // 0x0
	public const MonsterStorageType MstExtendStorage3 = 3; // 0x0
	public const MonsterStorageType MstWinkyStorage = 4; // 0x0
  */
        });
        for (let a = 0; a < astromonInventory.length; a++) {}
        astromonInventory.forEach((element) => {
          let astromonEntry = findAstromonData(element);
          makeAstromonIcon(astromonEntry, element);
        });
        astromonStorageContainerUpdateButton.classList.remove("is-loading");
        astromonStorageContainerUpdateButton.disabled = false;
        break;
      case "value-changes":
        document.getElementById("resulting-msg").innerHTML = data.body;

        break;
      case "timer-id":
        timerId = data.body;
    }
  };

  appListener.tick = (data) => {};
  appListener.error = (error) => {};
});

async function loadAllAstromon() {
  document.getElementById("astromon-grid-container").innerHTML = "";

  astromonStorageContainerUpdateButton.classList.add("is-loading");
  astromonStorageContainerUpdateButton.disabled = true;
  appListener.script("findbyUid", { user_id: 7901126, uid_s: allUid });
}

function findAstromonData(astromonData) {
  const matchingAstromon = database.astromons.find(
    (astromon) => astromon.uid === astromonData.monster_uid.value
  );
  if (matchingAstromon) {
    return matchingAstromon;
  }
  return null;
}

function makeAstromonIcon(constants, instance) {
  const astroString = `
  <div class="astromon-portrait" id=${instance.id.value}>
  <img src="assets/icons/${constants.icon_name}" alt="Icon" class="astromon-icon">
  <img src="assets/items/portrait-element-${constants.element}.png" alt="Element">
  <img src="assets/items/portrait-evo-${constants.evolution}.png" alt="Border">
</div>
  `;
  document.getElementById("astromon-grid-container").innerHTML += astroString;
}

const container = document.getElementById("astromon-grid-container");

let selectedAstromon = null;

container.addEventListener("click", function (event) {
  const clickedDiv = event.target.closest(".astromon-portrait");

  const matchingData = astromonInventory.find(
    (astromon) => astromon.id.value == clickedDiv.id
  );
  const jsonString = JSON.stringify(matchingData, null, 2);
  selectedAstromon = matchingData;
  let index = 0;
  const formattedString = jsonString.replace(/,/g, (match) => {
    index++;
    return index % 2 === 0 ? match : "<br>";
  });
  //document.getElementById("astromon-page-container").innerHTML = formattedString;
});

let astroChanges = [];

function makeChange(id) {
  let parsedId = id.replace(/^edit-field-astromon-/, "");

  let newValue = document.getElementById(
    `value-field-astromon-${parsedId}`
  ).value;

  const payload = {
    address_base: selectedAstromon.starting_add,
    offset: selectedAstromon[parsedId].offset,
    type: selectedAstromon[parsedId].type,
    new_value: newValue,
  };
  astroChanges.push(payload);
}

async function changeValues() {
  appListener.script("changeValues", { modifications: astroChanges });
  astroChanges = [];
}

async function changeSpeed() {
  appListener.script("changeSpeed", { game_speed: 6.5, address: null });
}

async function revertSpeed() {
  appListener.script("revertSpeed", { id: timerId });
}

const allUid = [
  513906150, 513906153, 513906152, 1772841661, 1772841658, 1772841659,
  892850849, 892850852, 892850851, 978897820, 978897817, 978897818, 773644136,
  773644135, 773644134, 1737659371, 1737659370, 1737659369, 767468693,
  767468690, 767468691, 1711834862, 1711834863, 1711834864, 755030345,
  755030348, 755030347, 1163781665, 1163781668, 1163781667, 109397590,
  109397593, 109397592, 1044989744, 1044989741, 1044989742, 912500659,
  912500658, 912500657, 564113398, 564113401, 564113400, 672951072, 672951071,
  672951070, 2088471686, 2088471687, 2088471688, 1401810039, 1401810040,
  1401810041, 1289330131, 1289330132, 1289330133, 1578992410, 1578992411,
  1578992412, 65780170, 65780173, 65780172, 651583706, 651583707, 651583708,
  1732124365, 1732124368, 1732124367, 971424010, 971424011, 971424012,
  1093394587, 1093394588, 1093394589, 1833617689, 1833617686, 1833617687,
  1235015920, 1235015919, 1235015918, 193884068, 193884067, 193884066,
  1437050715, 1437050714, 1437050713, 559561303, 559561302, 559561301,
  270456727, 270456726, 270456725, 1584294856, 1584294853, 1584294854,
  512471854, 512471855, 512471856, 274609595, 274609594, 274609593, 436083205,
  436083202, 436083203, 1340653412, 1340653411, 1340653410, 2076961593,
  2076961596, 2076961595, 1212215441, 1212215444, 1212215443, 1899194349,
  1899194352, 1899194351, 318488367, 318488368, 318488369, 598805138, 598805141,
  598805140, 417859707, 417859706, 417859705, 1569460239, 1569460238,
  1569460237, 1683467532, 1683467529, 1683467530, 122659503, 122659504,
  122659505, 465067048, 465067045, 465067046, 1617753175, 1617753174,
  1617753173, 1709946373, 1709946370, 1709946371, 1537824379, 1537824380,
  1537824381, 710497894, 710497897, 710497896, 1361438748, 1361438747,
  1361438746, 2073970739, 2073970738, 2073970737, 627045071, 627045070,
  627045069, 175079834, 175079837, 175079836, 319648601, 319648604, 319648603,
  1324145637, 1324145634, 1324145635, 669191658, 669191661, 669191660,
  1202933372, 1202933371, 1202933370, 1905121665, 1905121662, 1905121663,
  1301781817, 1301781820, 1301781819, 1069454194, 1069454195, 1069454196,
  538118302, 538118303, 538118304, 111975867, 111975868, 111975869, 2045991734,
  2045991737, 2045991736, 1624567606, 1624567609, 1624567608, 927008031,
  927008030, 927008029, 689698561, 689698558, 689698559, 1167702098, 1167702101,
  1167702100, 31879187, 31879188, 31879189, 765179270, 765179271, 765179272,
  588465333, 588465336, 588465335, 665535674, 665535675, 665535676, 527508945,
  527508942, 527508943, 1761155233, 1761155236, 1761155235, 1080465566,
  1080465569, 1080465568, 1620115213, 1954134773, 1954134776, 1954134775,
  72468742, 1726892913, 1726892910, 1726892911, 1905709584, 988440342,
  988440345, 988440344, 729527669, 2051229584, 2051229583, 2051229582,
  1786225771, 1087028930, 1087028933, 1087028932, 98055109, 601956727,
  601956726, 601956725, 1373201548, 1920408102, 1920408105, 1920408104,
  1347942833, 1652738587, 1652738588, 1652738589, 1752250274, 1215861071,
  1215861072, 1215861073, 424996280, 1407138834, 1407138837, 1407138836,
  1884658377, 1884658380, 1884658379, 1877946717, 1877946714, 1877946715,
  1698751362, 1698751365, 1698751364, 1736872948, 1736872947, 1736872946,
  1366131629, 1366131626, 1366131627, 2017903166, 2017903169, 2017903168,
  1830879546, 1830879549, 1830879548, 1620694403, 1620694404, 1620694405,
  1666707591, 1666707590, 1666707589, 1311022325, 1311022328, 1311022327,
  208178084, 208178081, 208178082, 1886605856, 1886605853, 1886605854,
  277864111, 277864112, 277864113, 509065623, 509065622, 509065621, 950561048,
  950561047, 950561046, 700741628, 1157546255, 1157546254, 1157546253, 26407837,
  186202087, 186202088, 186202089, 1164250697, 1252613560, 1252613559,
  1252613558, 1238845438, 1524438750, 1524438753, 1524438752, 692633930,
  225145554, 225145557, 225145556, 173771376, 173771373, 173771374, 1598287279,
  1598287280, 1598287281, 1917421498, 1917421501, 1917421500, 372681630,
  372681631, 372681632, 1142543374, 1142543375, 1142543376, 185963699,
  925303645, 925303648, 925303647, 305530004, 1365539280, 1365539279,
  1365539278, 1744369191, 1348404857, 1348404854, 1348404855, 807682968,
  491048569, 491048566, 491048567, 2041395008, 1695735501, 1695735504,
  1695735503, 56766508, 56766505, 56766506, 1875228552, 1875228549, 1875228550,
  105127847, 105127848, 105127849, 1652428271, 1652428270, 1652428269,
  1775251545, 1775251542, 1775251543, 1218638315, 1218638314, 1218638313,
  350102058, 350102061, 350102060, 872554559, 872554560, 872554561, 1177424359,
  1177424360, 1177424361, 38928311, 38928310, 38928309, 781695329, 781695332,
  781695331, 988289768, 988289767, 988289766, 269405757, 269405754, 269405755,
  1016336181, 1016336184, 1016336183, 804142024, 804142023, 804142022,
  1629626749, 1629626752, 1629626751, 485233202, 485233203, 485233204,
  112505693, 112505696, 112505695, 1397195401, 1397195398, 1397195399,
  1481959357, 1481959360, 1481959359, 995719039, 995719038, 995719037,
  631072510, 631072513, 631072512, 1595423927, 1595423926, 1595423925, 72796147,
  72796148, 72796149, 1476984169, 1476984172, 1476984171, 317118891, 317118890,
  317118889, 1353163626, 1353163629, 1353163628, 1663581827, 1663581826,
  1663581825, 1238728667, 1238728666, 1238728665, 992679749, 992679752,
  992679751, 1911812128, 1911812127, 1911812126, 330892515, 330892514,
  330892513, 1135773363, 1135773364, 1135773365, 489787580, 489787579,
  489787578, 1133347784, 1133347783, 1133347782, 1014134612, 1014134611,
  1014134610, 800433966, 811756894, 811756895, 811756896, 1274761396, 767982781,
  767982778, 767982779, 1954522309, 946714846, 946714847, 946714848, 1857617450,
  711086752, 711086749, 711086750, 280310346, 1357477135, 1357477136,
  1357477137, 681329450, 2041864364, 2041864363, 2041864362, 949605329,
  2033612920, 2033612919, 2033612918, 72115933, 1360314701, 1360314698,
  1360314699, 1850300098, 2002176257, 2002176260, 2002176259, 1592468716,
  1588280601, 1588280598, 1588280599, 1777007715, 1053710231, 1053710232,
  1053710233, 874531491, 823921638, 823921641, 823921640, 1503788532,
  1678694835, 1678694836, 1678694837, 651590731, 1844272880, 1844272877,
  1844272878, 214009024, 246384242, 246384243, 246384244, 2090590318,
  1373080470, 1373080471, 1373080472, 360614626, 85779667, 85779666, 85779665,
  279551747, 1656969944, 1656969941, 1656969942, 526421770, 603634038,
  603634041, 603634040, 1298787490, 370622122, 370622123, 370622124, 1192949974,
  1581429732, 1581429731, 1581429730, 1601828072, 1585167407, 1585167408,
  1585167409, 820005707, 1155464010, 1155464013, 1155464012, 985445346,
  473705446, 473705449, 473705448, 73974440, 482112026, 482112029, 482112028,
  1485313155, 1799313115, 1799313116, 1799313117, 1186207584, 1146283278,
  1146283281, 1146283280, 1575553011, 1704032275, 1704032276, 1704032277,
  738335306, 1520115399, 1520115400, 1520115401, 129188304, 1890438729,
  1890438726, 1890438727, 1752643404, 1363163623, 1363163622, 1363163621,
  2077961592, 1787815758, 1787815761, 1787815760, 639775707, 1714733051,
  1714733052, 1714733053, 1680797620, 1796685831, 1796685832, 1796685833,
  1174762720, 829600832, 829600831, 829600830, 80850736, 1857517335, 1857517334,
  1857517333, 644169019, 706776363, 706776362, 706776361, 1916103375, 180725510,
  180725511, 180725512, 1793792626, 293321540, 293321537, 293321538, 2113747990,
  1968585824, 1968585821, 1968585822, 1620821770, 415614555, 415614554,
  415614553, 547756365, 214696716, 214696713, 214696714, 839621194, 836892831,
  836892830, 836892829, 908633085, 541299983, 541299984, 541299985, 1130220219,
  1734059951, 1734059950, 1734059949, 1213459425, 457296113, 457296116,
  457296115, 671513065, 1282854852, 1282854851, 1282854850, 64393628, 354492733,
  354492736, 354492735, 1306031823, 67248637, 67248640, 67248639, 185605891,
  1728463078, 1728463079, 1728463080, 1146032637, 422689514, 422689515,
  422689516, 944707733, 1369248683, 1369248684, 1369248685, 1539002104,
  1753182596, 1753182593, 1753182594, 135685003, 573198610, 573198613,
  573198612, 844269935, 1112426323, 1112426324, 1112426325, 2029014976,
  1066497896, 1066497895, 1066497894, 321737769, 920732204, 920732203,
  920732202, 987899861, 1653824121, 1653824124, 1653824123, 1423599698,
  190729757, 190729760, 190729759, 362203630, 1386852375, 1386852374,
  1386852373, 1690742262, 1857256513, 1857256516, 1857256515, 1073128670,
  1959067476, 1959067475, 1959067474, 93521753, 707377105, 707377108, 707377107,
  1769480174, 925660672, 925660671, 925660670, 1989165833, 1488433626,
  1488433629, 1488433628, 1059773416, 1059773413, 1059773414, 200215601,
  200215604, 200215603, 900773581, 900773584, 900773583, 1803286568, 1803286565,
  1803286566, 1649840540, 1649840539, 1649840538, 1161191109, 1161191112,
  1161191111, 1624108125, 466502195, 466502194, 466502193, 388052533,
  1428184930, 1428184933, 1428184932, 765465944, 1707790755, 1707790754,
  1707790753, 984081385, 466541624, 466541621, 466541622, 303688472, 332153313,
  332153310, 332153311, 950665577, 1074905367, 1074905366, 1074905365,
  750972601, 902046086, 902046089, 902046088, 2140860022, 389133839, 389133838,
  389133837, 124286595, 432746031, 432746032, 432746033, 1093042075, 517354900,
  517354897, 517354898, 1123035419, 1123035418, 1123035417, 2054087264,
  2054087261, 2054087262, 1913088623, 1913088624, 1913088625, 2061448235,
  2061448236, 2061448237, 1621321253, 1621321256, 1621321255, 423091507,
  423091508, 423091509, 1138674376, 1138674373, 1138674374, 1552334779,
  1552334778, 1552334777, 31265396, 31265393, 31265394, 836924131, 836924130,
  836924129, 359249253, 359249256, 359249255, 190496786, 190496787, 190496788,
  799710061, 799710064, 799710063, 33262850, 33262851, 33262852, 511602683,
  511602684, 511602685, 532146512, 2090780658, 2090780659, 2090780660,
  1157557081, 226008316, 226008315, 226008314, 73425029, 1859364989, 1859364992,
  1859364991, 302009536, 377023645, 377023648, 377023647, 1708866142,
  1041291902, 1041291903, 1041291904, 17429097, 1441667736, 1441667735,
  1441667734, 880721709, 1412196763, 1412196764, 1412196765, 1510446092,
  1623765930, 1623765931, 1623765932, 2088866817, 1032970105, 1032970108,
  1032970107, 19541574, 1568064636, 1568064633, 1568064634, 425238863,
  425238862, 425238861, 1461325137, 1461325134, 1461325135, 934557108,
  934557107, 934557106, 579036489, 579036492, 579036491, 1424130093, 1424130090,
  1424130091, 607372939, 607372940, 607372941, 29981991, 29981992, 29981993,
  256809490, 256809493, 256809492, 1358611131, 1358611132, 1358611133,
  1551936428, 1551936425, 1551936426, 361006891, 361006892, 361006893,
  1175082147, 1175082146, 1175082145, 1594107230, 1594107231, 1594107232,
  1328483563, 1328483562, 1328483561, 1476776623, 1476776622, 1476776621,
  473219732, 473219731, 473219730, 1437595888, 1437595885, 1437595886,
  2031476911, 2031476912, 2031476913, 1108415904, 1108415901, 1108415902,
  1550852209, 1550852212, 1550852211, 919674934, 919674937, 919674936,
  159095242, 159095243, 159095244, 706928582, 706928585, 706928584, 147508567,
  147508566, 147508565, 1100098086, 1100098089, 1100098088, 1945925912,
  1945925911, 1945925910, 1216940948, 1216940947, 1216940946, 2039736341,
  2039736338, 2039736339, 1841925560, 1841925559, 1841925558, 806749405,
  806749408, 806749407, 2087910219, 2087910218, 2087910217, 1693936368,
  1693936365, 1693936366, 2036307631, 2036307630, 2036307629, 1450384147,
  1450384146, 1450384145, 638083013, 638083016, 638083015, 189600924, 189600923,
  189600922, 407510049, 407510052, 407510051, 1295524753, 1295524756,
  1295524755, 713618811, 713618810, 713618809, 1702058648, 1702058645,
  1702058646, 68641561, 68641564, 68641563, 612929774, 612929777, 612929776,
  189853826, 189853827, 189853828, 2003602245, 2003602248, 2003602247,
  1677525014, 1677525015, 1677525016, 1465488979, 1465488978, 1465488977,
  733579104, 733579103, 733579102, 1371408374, 1371408377, 1371408376,
  1156529412, 1156529411, 1156529410, 558313393, 558313396, 558313395,
  1861473569, 1861473572, 1861473571, 1623218334, 1623218337, 1623218336,
  368256463, 1488248314, 1488248317, 1488248316, 1118605199, 523063297,
  523063300, 523063299, 1881735302, 2142892532, 2142892529, 2142892530,
  159751819, 1441264555, 1441264554, 1441264553, 1474109532, 306412629,
  306412626, 306412627, 1766451778, 2065876115, 2065876114, 2065876113,
  87922122, 1788681008, 1788681005, 1788681006, 1144067815, 466870587,
  466870586, 466870585, 996028644, 1963998515, 1963998516, 1963998517,
  1752325790, 1430253770, 1430253773, 1430253772, 1494738707, 1494738708,
  1494738709, 253523183, 253523184, 253523185, 1629312589, 1629312586,
  1629312587, 1615679858, 1615679859, 1615679860, 391572801, 391572798,
  391572799, 1505528998, 1505528999, 1505529000, 1413571103, 1413571102,
  1413571101, 1320469022, 1320469025, 1320469024, 305760653, 305760650,
  305760651, 1741181050, 1741181053, 1741181052, 1000492820, 1000492819,
  1000492818, 459344685, 459344682, 459344683, 412552182, 412552185, 412552184,
  486824436, 486824435, 486824434, 821550489, 821550492, 821550491, 1900260388,
  1900260387, 1900260386, 67089905, 67089902, 67089903, 426655061, 426655064,
  426655063, 2130702240, 2130702237, 2130702238, 1080095355, 1080095356,
  1080095357, 115542104, 115542101, 115542102, 1759037195, 1759037196,
  1759037197, 1245396039, 1245396038, 1245396037, 307941510, 307941513,
  307941512, 1435045919, 1722257724, 1722257721, 1722257722, 1683578447,
  1913324091, 1913324092, 1913324093, 651161790, 1031163508, 1031163505,
  1031163506, 20976647, 316049208, 316049207, 316049206, 1525461413, 1397946659,
  1397946658, 1397946657, 1835519296, 1835519293, 1835519294, 674018329,
  674018326, 674018327, 488910982, 488910985, 488910984, 1239769042, 1239769043,
  1239769044, 778595986, 778595989, 778595988, 127288067, 127288066, 127288065,
  2007927886, 2007927889, 2007927888, 1273320530, 1273320533, 1273320532,
  1006723776, 1006723773, 1006723774, 470565915, 470565914, 470565913,
  1121486275, 1121486276, 1121486277, 704183025, 704183022, 704183023,
  1527429959, 1527429958, 1527429957, 244864428, 244864425, 244864426,
  549781347, 549781348, 549781349, 131989855, 131989856, 131989857, 254668107,
  254668108, 254668109, 472510456, 472510453, 472510454, 97248837, 97248840,
  97248839, 1583195618, 1583195621, 1583195620, 1421723310, 1421723311,
  1421723312, 2024491018, 2024491019, 2024491020, 885599429, 920967949,
  920967952, 920967951, 2038216914, 619611010, 619611011, 619611012, 1344452933,
  1828593741, 1828593744, 1828593743, 2121792432, 177021545, 177021548,
  177021547, 357228830, 163862110, 163862111, 163862112, 1399500856, 1399500855,
  1399500854, 816153753, 816153750, 816153751, 246257400, 246257399, 246257398,
  754063314, 754063317, 754063316, 1221347963, 1221347962, 1221347961,
  1768977389, 1768977392, 1768977391, 1613437886, 1613437887, 1613437888,
  1787523705, 1787523708, 1787523707, 644012553, 644012550, 644012551,
  322666594, 322666595, 322666596, 1435663547, 1435663548, 1435663549,
  1526108291, 1526108290, 1526108289, 352405954, 352405955, 352405956,
  1682440558, 1682440561, 1682440560, 1757510573, 1757510576, 1757510575,
  1397310810, 1922717163, 1922717164, 1922717165, 1335841592, 1522741284,
  1522741281, 1522741282, 1077951835, 231046419, 231046418, 231046417,
  383651010, 1648830411, 1648830412, 1648830413, 1266269062, 1987444789,
  1987444792, 1987444791, 1644335599, 1644335598, 1644335597, 388235655,
  388235654, 388235653, 1863785640, 1863785639, 1863785638, 1698462666,
  1698462667, 1698462668, 2060304769, 2060304766, 2060304767, 635671006,
  635671007, 635671008, 2073328092, 2073328089, 2073328090, 25388462, 25388465,
  25388464, 588706749, 588706746, 588706747, 1860641105, 1860641102, 1860641103,
  1879384580, 1879384577, 1879384578, 2058285720, 2058285719, 2058285718,
  700033935, 700033936, 700033937, 537252125, 537252128, 537252127, 1224791266,
  1224791267, 1224791268, 977921257, 977921260, 977921259, 205555521, 205555524,
  205555523, 968026249, 968026252, 968026251, 55682560, 55682557, 55682558,
  1267593908, 1267593905, 1267593906, 510883039, 510883038, 510883037,
  614834695, 614834696, 614834697, 583821713, 583821716, 583821715, 925381130,
  925381133, 925381132, 614614486, 614614489, 614614488, 174898091, 174898092,
  174898093, 1156014883, 1156014882, 1156014881, 799753755, 799753756,
  799753757, 1659311568, 1659311567, 1659311566, 958753588, 958753587,
  958753586, 1230171617, 1230171614, 1230171615, 785599589, 785599592,
  785599591, 1677171492, 1677171489, 1677171490, 1224513613, 1224513610,
  1224513611, 794870353, 794870356, 794870355, 1683836246, 1683836249,
  1683836248, 949307088, 949307087, 949307086, 872489371, 872489372, 872489373,
  415436466, 415436467, 415436468, 1031489204, 1031489203, 1031489202,
  1793220705, 1793220702, 1793220703, 712863973, 712863976, 712863975,
  196540184, 196540183, 196540182, 1420883980, 1420883979, 1420883978,
  1684264428, 1684264427, 1684264426, 2040835571, 2040835570, 2040835569,
  1991094407, 1991094406, 1991094405, 2060716430, 2060716431, 2060716432,
  848841664, 848841661, 848841662, 2098231476, 2098231475, 2098231474,
  584266527, 584266528, 584266529, 584752635, 584752636, 584752637, 1003821584,
  1003821583, 1003821582, 2061639010, 2061639013, 2061639012, 1279982848,
  1279982845, 1279982846, 372598884, 372598881, 372598882, 474531341, 474531338,
  474531339, 2099370504, 2099370501, 2099370502, 603294199, 603294200,
  603294201, 2008447153, 2008447156, 2008447155, 269698958, 269698959,
  269698960, 1016214646, 1016214649, 1016214648, 544274325, 544274322,
  544274323, 788334428, 788334425, 788334426, 375062680, 375062677, 375062678,
  1602425403, 1602425402, 1602425401, 1507365923, 1507365924, 1507365925,
  1781487706, 1781487709, 1781487708, 200430892, 200430889, 200430890,
  1670526643, 1670526644, 1670526645, 121756864, 121756861, 121756862,
  850996694, 850996695, 850996696, 909925105, 909925102, 909925103, 982834949,
  982834946, 982834947, 2055797658, 2055797659, 2055797660, 805753588,
  805753587, 805753586, 734054787, 734054786, 734054785, 2045611444, 2045611443,
  2045611442, 2077391517, 2077391520, 2077391519, 856576129, 856576126,
  856576127, 920737783, 920737782, 920737781, 367570268, 367570265, 367570266,
  945539219, 945539220, 945539221, 1072117299, 1072117298, 1072117297,
  1017321349, 1017321346, 1017321347, 95380591, 95380590, 95380589, 1411334962,
  1411334965, 1411334964, 1878385679, 1878385678, 1878385677, 1442369360,
  1442369357, 1442369358, 298888722, 298888723, 298888724, 1819007170,
  1819007171, 1819007172, 1462656139, 1462656138, 1462656137, 1588434214,
  1588434215, 1588434216, 273455573, 273455570, 273455571, 334814812, 334814809,
  334814810, 678048775, 678048776, 678048777, 1319440339, 1319440340,
  1319440341, 1484872743, 1484872744, 1484872745, 2033018805, 2033018802,
  2033018803, 598220820, 598220819, 598220818, 1267708301, 1267708304,
  1267708303, 1892169129, 1892169132, 1892169131, 1047478185, 1047478182,
  1047478183, 25999950, 25999951, 25999952, 1573699471, 1573699470, 1573699469,
  256792284, 256792283, 256792282, 1693281538, 1693281541, 1693281540,
  963167588, 963167585, 963167586, 607519738, 607519741, 607519740, 71219175,
  71219176, 71219177, 1271346190, 1271346193, 1271346192, 191784090, 191784091,
  191784092, 1250821349, 1250821346, 1250821347, 826176576, 826176575,
  826176574, 208706554, 208706557, 208706556, 1717849687, 1717849688,
  1717849689, 1423277302, 1423277303, 1423277304, 554736400, 554736399,
  554736398, 1012478649, 1012478646, 1012478647, 1946493369, 1946493366,
  1946493367, 2081942697, 2081942700, 2081942699, 1317069524, 1317069523,
  1317069522, 1141383647, 1141383648, 1141383649, 1481564270, 1481564271,
  1481564272, 609565942, 609565945, 609565944, 898902086, 898902089, 898902088,
  1704151359, 1704151358, 1704151357, 1820008195, 1820008196, 1820008197,
  1856341509, 1856341512, 1856341511, 1633940214, 1633940217, 1633940216,
  626023344, 626023341, 626023342, 1343434851, 1343434852, 1343434853,
  1849573303, 1849573302, 1849573301, 178739615, 178739616, 178739617,
  1798474733, 1798474736, 1798474735, 779281418, 779281419, 779281420,
  440095417, 440095420, 440095419, 1614221757, 1614221754, 1614221755,
  1977375979, 1977375980, 1977375981, 1318077978, 1318077981, 1318077980,
  147641416, 147641413, 147641414, 1669249629, 1669249632, 1669249631,
  1021427915, 1021427914, 1021427913, 1317076250, 1317076253, 1317076252,
  1135398323, 1135398324, 1135398325, 1311396063, 1311396062, 1311396061,
  616314015, 616314014, 616314013, 1906633665, 1906633668, 1906633667,
  1677373248, 1677373247, 1677373246, 244031881, 244031884, 244031883,
  196709669, 196709666, 196709667, 903055793, 903055796, 903055795, 1525491867,
  1525491868, 1525491869, 1128305436, 1128305433, 1128305434, 1718374339,
  1718374338, 1718374337, 1880463667, 1880463666, 1880463665, 69807172,
  69807169, 69807170, 644801348, 644801345, 644801346, 1611719281, 1611719284,
  1611719283, 1653670674, 1653670675, 1653670676, 1246526802, 1246526803,
  1246526804, 786308654, 786308657, 786308656, 337584276, 337584273, 337584274,
  373759583, 373759582, 373759581, 1785152774, 1785152777, 1785152776, 99046914,
  99046915, 99046916, 124634951, 124634950, 124634949, 281886393, 281886390,
  281886391, 1825291664, 1825291663, 1825291662, 1151599069, 1151599072,
  1151599071, 1209844725, 1209844728, 1209844727, 2085412100, 2085412097,
  2085412098, 492749071, 492749070, 492749069, 196480478, 196480481, 196480480,
  1085671963, 1085671962, 1085671961, 284508187, 284508186, 284508185,
  1537885535, 1537885536, 1537885537, 946503055, 946503054, 946503053,
  463650289, 463650292, 463650291, 1514221740, 1514221739, 1514221738,
  651707355, 651707356, 651707357, 817870236, 817870235, 817870234, 445035320,
  445035317, 445035318, 1229817221, 1229817218, 1229817219, 1196170040,
  1196170039, 1196170038, 432926387, 432926388, 432926389, 1003772000,
  1003771999, 1003771998, 1311426792, 1311426789, 1311426790, 1108216566,
  1108216569, 1108216568, 1488456140, 1488456137, 1488456138, 365299193,
  365299190, 365299191, 941819742, 941819745, 941819744, 611617115, 611617114,
  611617113, 1683749338, 1683749339, 1683749340, 1897129396, 1897129395,
  1897129394, 608204483, 608204482, 608204481, 743885940, 743885939, 743885938,
  421333469, 421333472, 421333471, 1714384286, 1714384289, 1714384288,
  1915852884, 1915852881, 1915852882, 806016587, 806016588, 806016589,
  296481732, 296481729, 296481730, 1569405936, 1569405935, 1569405934,
  1446950552, 1446950551, 1446950550, 1371921390, 1371921391, 1371921392,
  507339629, 507339632, 507339631, 746936778, 746936779, 746936780, 2020828254,
  2020828257, 2020828256, 1903694428, 1903694425, 1903694426, 27368523,
  27368522, 27368521, 1484469644, 1484469641, 1484469642, 1892059939,
  1892059938, 1892059937, 1782511367, 1782511368, 1782511369, 895082297,
  895082294, 895082295, 397907178, 397907181, 397907180, 918226452, 918226449,
  918226450, 1374849943, 1374849944, 1374849945, 2028591083, 2028591082,
  2028591081, 1963970474, 1963970475, 1963970476, 1859305700, 1859305699,
  1859305698, 666987165, 666987168, 666987167, 81698948, 81698947, 81698946,
  1119642908, 1119642905, 1119642906, 1228014412, 1228014409, 1228014410,
  771093941, 771093938, 771093939, 432447161, 432447158, 432447159, 560041188,
  560041185, 560041186, 1541620296, 1541620295, 1541620294, 614707141,
  614707144, 614707143, 1204767027, 1204767028, 1204767029, 2108911562,
  2108911565, 2108911564, 1599900703, 1599900704, 1599900705, 919082931,
  919082932, 919082933, 1466124743, 1466124744, 1466124745, 264730500,
  264730497, 264730498, 694209289, 694209292, 694209291, 587472534, 587472537,
  587472536, 1936469154, 1936469155, 1936469156, 1584625184, 1584625183,
  1584625182, 7389006, 7389007, 7389008, 1244420725, 1244420722, 1244420723,
  199787046, 199787047, 199787048, 728164, 728161, 728162, 785741806, 785741809,
  785741808, 528568718, 528568721, 528568720, 846205199, 846205198, 846205197,
  1710692508, 1710692505, 1710692506, 582851024, 582851023, 582851022,
  1568287527, 1568287526, 1568287525, 485501361, 485501358, 485501359,
  1984784164, 1984784163, 1984784162, 2001506349, 2001506346, 2001506347,
  1716431812, 1716431811, 1716431810, 1889974239, 1889974238, 1889974237,
  367901130, 367901131, 367901132, 863080980, 863080979, 863080978, 952320313,
  952320310, 952320311, 919210189, 919210192, 919210191, 416458001, 416457998,
  416457999, 1985012904, 1985012903, 1985012902, 28572531, 28572530, 28572529,
  208602045, 208602042, 208602043, 1886334761, 1886334758, 1886334759,
  1865411919, 1865411918, 1865411917, 137754671, 137754672, 137754673,
  208916591, 208916590, 208916589, 1230019153, 1230019156, 1230019155,
  664249074, 664249075, 664249076, 1966367225, 1966367228, 1966367227,
  2026666125, 2026666128, 2026666127, 326275682, 326275683, 326275684,
  136577605, 1705287735, 1705287734, 1705287733, 608981172, 1822409983,
  1822409984, 1822409985, 256391864, 828149008, 828149007, 828149006,
  1383211977, 445107814, 445107817, 445107816, 862736431, 1329987403, 539622682,
  879918970, 511558321, 2004410110, 2004410113, 2004410112, 951840218,
  951840219, 951840220, 753989198, 753989199, 753989200, 123704639, 123704640,
  123704641, 1907232654, 1907232655, 1907232656, 1979709989, 1979709986,
  1979709987, 1511360116, 1511360115, 1511360114, 2133398476, 2133398475,
  2133398474, 2135040699, 2135040700, 2135040701, 417621146, 417621149,
  417621148, 1720338722, 1720338725, 1720338724, 1001075174, 1001075177,
  1001075176, 866711187, 866711186, 866711185, 571002846, 571002847, 571002848,
  1280580682, 1280580683, 1280580684, 504542011, 504542012, 504542013,
  286340490, 286340491, 286340492, 790002649, 790002652, 790002651, 601576747,
  601576748, 601576749, 1166138745, 1166138742, 1166138743, 2062311064,
  2062311063, 2062311062, 1989305185, 1989305188, 1989305187, 923755813,
  923755816, 923755815, 334392917, 334392920, 334392919, 1466566845, 1466566848,
  1466566847, 808230488, 808230487, 808230486, 1906647404, 1906647403,
  1906647402, 163046709, 163046712, 163046711, 789314366, 789314367, 789314368,
  1829150924, 1829150921, 1829150922, 1806095245, 1806095242, 1806095243,
  3785420, 3785417, 3785418, 258351890, 258351893, 258351892, 560989051,
  560989052, 560989053, 1566654475, 1566654476, 1566654477, 1953749229,
  1953749226, 1953749227, 739664715, 739664714, 739664713, 1045295392,
  1045295389, 1045295390, 1224546563, 1224546562, 1224546561, 349665928,
  349665925, 349665926, 1292194892, 1292194889, 1292194890, 1182681707,
  1182681708, 1182681709, 236319012, 236319009, 236319010, 1466954899,
  1466954898, 1466954897, 533344827, 533344826, 533344825, 1213974243,
  1213974244, 1213974245, 538730218, 538730219, 538730220, 1474791262,
  1474791263, 1474791264, 897507229, 897507226, 897507227, 2003929477,
  2003929480, 2003929479, 1769785000, 1769784997, 1769784998, 583739106,
  583739109, 583739108, 1297931158, 1297931159, 1297931160, 1529920122,
  1529920123, 1529920124, 1981388223, 1981388222, 1981388221, 1234126992,
  1234126991, 1234126990, 646488217, 646488214, 646488215, 1455985302,
  1455985303, 1455985304, 968712144, 968712143, 968712142, 969778955, 969778956,
  969778957, 314404212, 314404209, 314404210, 1167423570, 1167423573,
  1167423572, 2023852125, 2023852122, 2023852123, 2085632727, 2085632728,
  2085632729, 327863986, 327863989, 327863988, 1584801279, 1584801278,
  1584801277, 608632279, 608632278, 608632277, 919593085, 919593082, 919593083,
  1420909975, 1420909976, 1420909977, 1708762096, 1708762093, 1708762094,
  839470775, 839470776, 839470777, 1333621243, 1333621244, 1333621245,
  1898728695, 1898728694, 1898728693, 133337913, 133337916, 133337915,
  1974917276, 1974917275, 1974917274, 416292209, 416292206, 416292207,
  208746732, 208746731, 208746730, 1629964926, 1629964929, 1629964928,
  133856541, 133856538, 133856539, 32744417, 32744414, 32744415, 1213606500,
  1213606497, 1213606498, 1083485392, 1083485391, 1083485390, 864646833,
  864646836, 864646835, 1315398184, 1315398181, 1315398182, 1443441390,
  1443441393, 1443441392, 1788262299, 1788262300, 1788262301, 1630761783,
  1630761784, 1630761785, 357836008, 357836007, 357836006, 630571133, 630571136,
  630571135, 393273025, 393273028, 393273027, 887380205, 887380208, 887380207,
  1045399699, 1045399698, 1045399697, 1274338778, 1274338781, 1274338780,
  599930987, 599930988, 599930989, 1716998278, 1716998281, 1716998280,
  163117476, 163117475, 163117474, 194963520, 194963519, 194963518, 704116323,
  704116324, 704116325, 1759637756, 1759637753, 1759637754, 917626824,
  917626821, 917626822, 1695195924, 1695195923, 1695195922, 407270087,
  407270088, 407270089, 1854195771, 1854195772, 1854195773, 901626666,
  901626667, 901626668, 2037641072, 2037641069, 2037641070, 1816958811,
  1816958810, 1816958809, 2029899690, 2029899691, 2029899692, 2094963272,
  2094963269, 2094963270, 1275819570, 1275819573, 1275819572, 249246670,
  249246673, 249246672, 1659351757, 1659351760, 1659351759, 146634296,
  146634293, 146634294, 1314883567, 1314883566, 1314883565, 1667341153,
  1667341150, 1667341151, 526070936, 526070933, 526070934, 671836636, 671836633,
  671836634, 757309835, 757309836, 757309837, 364185071, 364185072, 364185073,
  406616588, 406616585, 406616586, 401477048, 401477045, 401477046, 1016895759,
  1016895760, 1016895761, 1125036980, 1125036977, 1125036978, 197637978,
  197637979, 197637980, 1534628358, 1534628361, 1534628360, 1089356178,
  1089356181, 1089356180, 775811619, 775811618, 775811617, 1076673788,
  1076673785, 1076673786, 1252505224, 1252505223, 1252505222, 1696770480,
  1696770479, 1696770478, 1269411786, 1269411787, 1269411788, 1312555509,
  1312555506, 1312555507, 451814439, 451814438, 451814437, 2122236529,
  2122236532, 2122236531, 423587440, 423587439, 423587438, 1892674641,
  1892674638, 1892674639, 2021166575, 2021166576, 2021166577, 1972586434,
  1972586437, 1972586436, 1543295465, 1543295468, 1543295467, 962005618,
  962005619, 962005620, 34324495, 34324494, 34324493, 1854800012, 1854800011,
  1854800010, 1510127210, 1510127213, 1510127212, 923085069, 923085072,
  923085071, 593772939, 593772940, 593772941, 1208679440, 1208679437,
  1208679438, 884388723, 884388722, 884388721, 1357296590, 1357296593,
  1357296592, 759035804, 759035803, 759035802, 798412159, 798412160, 798412161,
  2142160491, 2142160492, 2142160493, 1240815302, 1240815303, 1240815304,
  1332913490, 1332913493, 1332913492, 355432286, 1911306288, 1340555849,
  1105737466, 129568466, 724568868, 789809317, 789809320, 1269895159,
  1269895158, 902523962, 902523965, 1332993843, 1332993844, 194218711,
  194218710, 1896596241, 1896596244,
];
