/**
 * The ABC trek plan as data. Everything the app shows comes from here, so the
 * plan (a price, a new alternative, a story) changes without touching UI code.
 *
 * Costs are per person in INR: [id, label, default, min, max]. Defaults are the
 * figures from the original plan document; where a day's items did not add up
 * to the plan's own estimate, a "Misc (plan rounding)" line makes up the
 * difference so the defaults total exactly what the plan says.
 *
 * Legs: [from, to, mode, kmMin, kmMax, hoursMin, hoursMax, note?].
 * Map positions (`map`) are hand-placed on a 1000 x 720 canvas; trail lat/lng
 * are approximate.
 */
import type { TripData } from "./types";

export const D: TripData = {
  "version": 1,
  "title": "Annapurna Base Camp",
  "defaultStartDate": null,
  "inrToNpr": 1.6,
  "places": {
    "blr": {
      "name": "Bengaluru",
      "short": "BLR",
      "alt": 915,
      "ll": [
        13.1986,
        77.7066
      ],
      "map": [
        70,
        690
      ],
      "label": "right",
      "region": "gateway",
      "blurb": "Home base. Kempegowda International Airport is where the trip starts and ends, whichever way you go.",
      "facts": [
        "The airport is named after Kempe Gowda I, the 16th-century chieftain who founded Bengaluru in 1537.",
        "Terminal 2 is designed as a \"terminal in a garden\", with hanging gardens and indoor greenery throughout.",
        "Bengaluru sits at roughly 920 m. Annapurna Base Camp is about 4.5 times higher.",
        "The city is nicknamed both the Garden City and the Silicon Valley of India."
      ],
      "notes": {
        "stay": "Home",
        "network": "Full coverage",
        "atm": "Everywhere"
      },
      "wiki": "https://en.wikipedia.org/wiki/Kempegowda_International_Airport"
    },
    "gorakhpur": {
      "name": "Gorakhpur",
      "short": "GOP",
      "alt": 77,
      "ll": [
        26.7606,
        83.3732
      ],
      "map": [
        165,
        640
      ],
      "label": "right",
      "region": "gateway",
      "blurb": "The cheapest gateway: fly into Gorakhpur (airport code GOP) and ride about 100 km north to the open border at Sonauli.",
      "facts": [
        "Gorakhpur Junction's 1,366 m platform was the world's longest from 2013 until Hubballi's roughly 1,505 m platform took the record in 2023.",
        "The city is named after the yogi Gorakhnath, and the Gorakhnath Temple is the seat of the Nath tradition.",
        "Gita Press, founded here in 1923, is one of the world's largest publishers of Hindu religious texts.",
        "Gorakhpur is the headquarters of Indian Railways' North Eastern Railway zone."
      ],
      "notes": {
        "stay": "Hotels near the station and airport",
        "network": "Full coverage",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Gorakhpur"
    },
    "sonauli": {
      "name": "Sonauli border",
      "short": "Border",
      "alt": 100,
      "ll": [
        27.4747,
        83.4676
      ],
      "map": [
        245,
        600
      ],
      "label": "right",
      "region": "gateway",
      "blurb": "One of the busiest India-Nepal crossings. Belahiya is on the Nepal side, with Bhairahawa just beyond.",
      "facts": [
        "Indian citizens need no visa for Nepal. A valid passport or Election Commission voter ID is enough, thanks to the 1950 Treaty of Peace and Friendship.",
        "Nepal is on UTC+5:45, so set your watch 15 minutes ahead when you cross.",
        "The Nepali rupee has been pegged at 1 INR = 1.6 NPR since the early 1990s, so the conversion never changes.",
        "The crossing is open to Indian and Nepali citizens round the clock; other nationalities need the immigration office's hours."
      ],
      "notes": {
        "stay": "Basic lodges both sides",
        "network": "Indian SIMs fade fast; buy an Ncell or NTC SIM in Bhairahawa",
        "atm": "Yes, both sides"
      },
      "wiki": "https://en.wikipedia.org/wiki/Sunauli"
    },
    "bhairahawa": {
      "name": "Bhairahawa",
      "short": "Bhairahawa",
      "alt": 105,
      "ll": [
        27.5055,
        83.4522
      ],
      "map": [
        310,
        575
      ],
      "label": "right",
      "region": "gateway",
      "blurb": "Officially Siddharthanagar. The bus park here has day and night buses to Pokhara, about 185 km away on the Siddhartha Highway.",
      "facts": [
        "Its official name, Siddharthanagar, honours Siddhartha Gautama, the Buddha, who was born about 22 km away in Lumbini.",
        "Gautam Buddha International Airport opened here in May 2022, making it Nepal's second international airport.",
        "The Siddhartha Highway to Pokhara climbs out of the flat Terai through the Mahabharat hills: you go from about 100 m to 822 m.",
        "The Terai plains around Bhairahawa are Nepal's rice bowl, a very different Nepal from the mountains you are heading to."
      ],
      "notes": {
        "stay": "Budget hotels near the bus park",
        "network": "Good 4G",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Siddharthanagar"
    },
    "lumbini": {
      "name": "Lumbini",
      "short": "Lumbini",
      "alt": 150,
      "ll": [
        27.4697,
        83.2755
      ],
      "map": [
        215,
        690
      ],
      "label": "right",
      "region": "gateway",
      "blurb": "Birthplace of the Buddha and a UNESCO World Heritage Site, a short detour from Bhairahawa.",
      "facts": [
        "Lumbini is where Siddhartha Gautama, the Buddha, was born. It became a UNESCO World Heritage Site in 1997.",
        "Emperor Ashoka visited in 249 BCE and raised a pillar whose inscription records that the Buddha was born here.",
        "Inside the Maya Devi Temple, a marker stone pinpoints the exact spot of the birth.",
        "The surrounding Monastic Zone, laid out to a master plan by Japanese architect Kenzo Tange, holds monasteries built by many different countries."
      ],
      "notes": {
        "stay": "Guesthouses and monastery stays",
        "network": "Good 4G",
        "atm": "A few"
      },
      "wiki": "https://en.wikipedia.org/wiki/Lumbini"
    },
    "kathmandu": {
      "name": "Kathmandu",
      "short": "KTM",
      "alt": 1400,
      "ll": [
        27.7172,
        85.324
      ],
      "map": [
        935,
        670
      ],
      "label": "left",
      "region": "gateway",
      "blurb": "Nepal's capital and its main international gateway. Faster to reach than the border route, but pricier.",
      "facts": [
        "The Kathmandu Valley has seven monument zones under a single UNESCO World Heritage listing, inscribed in 1979.",
        "The city's name is thought to come from Kasthamandap, a pavilion said to have been built from the wood of a single tree.",
        "The Kumari, a living goddess, lives in the Kumari Ghar on Kathmandu Durbar Square.",
        "Nepal's flag, two stacked pennants, is the only national flag in the world that is not a rectangle."
      ],
      "notes": {
        "stay": "Thamel has every budget",
        "network": "Good 4G",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Kathmandu"
    },
    "pokhara": {
      "name": "Pokhara",
      "short": "PKR",
      "alt": 822,
      "ll": [
        28.2096,
        83.9586
      ],
      "map": [
        770,
        625
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Lakeside base for the trek: permits, gear rentals, paragliding and your last proper ATM.",
      "facts": [
        "Phewa Lake is Nepal's second-largest lake. The Tal Barahi temple sits on a small island in the middle of it.",
        "Machhapuchhre (6,993 m) stands just ~30 km from the city at 822 m, one of the steepest rises from a city to a summit anywhere.",
        "The Seti Gandaki river runs through gorges under the city that narrow to just a few metres in places.",
        "The International Mountain Museum documents the history of Himalayan mountaineering and the people of the mountains.",
        "Sarangkot, above the lake, is one of the world's most popular paragliding launch sites."
      ],
      "notes": {
        "stay": "Lakeside guesthouses INR 1-2K",
        "network": "Good 4G, fast Wi-Fi",
        "atm": "Plenty. Treat Pokhara as your last reliable ATM."
      },
      "wiki": "https://en.wikipedia.org/wiki/Pokhara",
      "links": [
        {
          "label": "Nepal Tourism Board, Pokhara (permits)",
          "url": "https://maps.app.goo.gl/uHJLVaCeL7mYE6PY9"
        }
      ]
    },
    "kimche": {
      "name": "Kimche",
      "short": "Kimche",
      "alt": 1640,
      "ll": [
        28.3665,
        83.818
      ],
      "map": [
        702,
        488
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Road head below Ghandruk. Jeeps from Pokhara drop you here, about 1 to 1.5 hours of stone steps under Ghandruk.",
      "facts": [
        "The jeep road via Nayapul cut the old full first day of walking down to about an hour of stone steps.",
        "On the drive you pass the ACAP check post near Birethanti. Keep your permit handy, because it costs double if you buy it at a check post.",
        "The terraced fields around Kimche grow rice and millet, carved into the hillside over generations.",
        "From here the Modi Khola valley leads all the way north to the Annapurna Sanctuary."
      ],
      "notes": {
        "stay": "A couple of lodges",
        "network": "Good 4G",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "ghandruk": {
      "name": "Ghandruk",
      "short": "Ghandruk",
      "alt": 1940,
      "ll": [
        28.3758,
        83.8075
      ],
      "map": [
        672,
        458
      ],
      "label": "left",
      "region": "trek",
      "blurb": "A large Gurung village of slate-roofed stone houses, facing Annapurna South, Hiunchuli and Machhapuchhre.",
      "facts": [
        "The Annapurna Conservation Area Project, Nepal's first conservation area, started in 1986 with Ghandruk as its pilot village.",
        "Ghandruk is famous for its Gurung soldiers. Generations have served in the Gurkha regiments of the British and Indian armies.",
        "The Gurung Museum shows traditional tools, clothing and household life. You can also try on Gurung dress.",
        "The houses are roofed with hand-cut slate, which keeps them cool in summer and warm in winter."
      ],
      "notes": {
        "stay": "Gurung Cottage and many lodges, INR 1.5-3K",
        "network": "Good 4G",
        "atm": "Do not count on it"
      },
      "wiki": "https://en.wikipedia.org/wiki/Ghandruk",
      "links": [
        {
          "label": "Gurung Cottage",
          "url": "https://maps.app.goo.gl/zZSfvuDq6Cj2CVVq9"
        }
      ]
    },
    "chhomrong": {
      "name": "Chhomrong",
      "short": "Chhomrong",
      "alt": 2170,
      "ll": [
        28.4157,
        83.8197
      ],
      "map": [
        690,
        360
      ],
      "label": "left",
      "region": "trek",
      "blurb": "Gateway to the Annapurna Sanctuary, and home to the famous stone staircase and its bakeries.",
      "facts": [
        "Chhomrong is famous for its stone staircase: thousands of steps down to the Chhomrong Khola and up the far side.",
        "The ACAP check post here records everyone heading into the Sanctuary, so keep your permit to hand.",
        "Above Chhomrong the Sanctuary is considered sacred by local Gurung communities, and many lodges beyond here do not serve meat.",
        "Trekkers rave about Chhomrong's chocolate cake, a reward for climbing the stairs."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K",
        "network": "4G patchy, paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Chhomrong"
    },
    "sinuwa": {
      "name": "Upper Sinuwa",
      "short": "Sinuwa",
      "alt": 2360,
      "ll": [
        28.429,
        83.825
      ],
      "map": [
        722,
        328
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Ridge-top lodges with the first close-up view of Machhapuchhre's fishtail summit.",
      "facts": [
        "Sinuwa comes in two parts, Upper and Lower. The faster itinerary sleeps at Upper Sinuwa to skip a night in Chhomrong.",
        "The forest here is full of rhododendron, Nepal's national flower (lali gurans), which turns the hills red in March and April.",
        "Grey langur monkeys are often seen in the trees between Sinuwa and Bamboo.",
        "Machhapuchhre looks like a single sharp spire from here. Its twin 'fishtail' summit only shows from other angles."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K",
        "network": "Patchy",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "bamboo": {
      "name": "Bamboo",
      "short": "Bamboo",
      "alt": 2310,
      "ll": [
        28.448,
        83.834
      ],
      "map": [
        740,
        285
      ],
      "label": "left",
      "region": "trek",
      "blurb": "A cluster of lodges deep in the Modi Khola gorge, wrapped in bamboo forest. Cool, shady and damp.",
      "facts": [
        "It is named for the dense bamboo forest. Locals cut the bamboo to weave baskets and mats.",
        "The gorge is so deep that the sun reaches the lodges late and leaves early, so it gets cold quickly in the evening.",
        "There are only a handful of lodges, so in peak season (Oct to Nov, Mar to Apr) they fill up early in the day.",
        "Above Bamboo, food prices climb with every hour of trail because everything is carried up by porters or mules."
      ],
      "notes": {
        "stay": "Few lodges, book early in peak season",
        "network": "Weak",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "dovan": {
      "name": "Dovan",
      "short": "Dovan",
      "alt": 2600,
      "ll": [
        28.458,
        83.84
      ],
      "map": [
        758,
        258
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Small lodge stop where waterfalls pour down the gorge walls and the forest starts to thin.",
      "facts": [
        "'Dovan' (dobhan) means a confluence of rivers in Nepali. Side streams meet the Modi Khola here.",
        "Between Dovan and Himalaya the forest changes from bamboo to oak and rhododendron.",
        "In monsoon and after rain, tall waterfalls stream off the cliffs above the lodges.",
        "The roar you hear all night is the Modi Khola, fed by Annapurna's glaciers."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K",
        "network": "Weak, paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Modi_Khola"
    },
    "himalaya": {
      "name": "Himalaya",
      "short": "Himalaya",
      "alt": 2920,
      "ll": [
        28.471,
        83.85
      ],
      "map": [
        776,
        228
      ],
      "label": "left",
      "region": "trek",
      "blurb": "Named after the Himalaya Hotel, its first lodge. The last stop before the avalanche-prone stretch.",
      "facts": [
        "It is a lodge stop rather than a village, named after its original lodge, the Himalaya Hotel.",
        "Just above is Hinku Cave, an overhanging rock once used as shelter by shepherds and early expeditions.",
        "Between Himalaya and MBC the trail crosses avalanche chutes, so after heavy snow, ask the lodges before you go on.",
        "Snow can linger in the gullies here well into spring."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K",
        "network": "Weak",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "deurali": {
      "name": "Deurali",
      "short": "Deurali",
      "alt": 3230,
      "ll": [
        28.485,
        83.862
      ],
      "map": [
        806,
        196
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Last lodges before the valley opens into the Sanctuary. Cold nights, big views.",
      "facts": [
        "'Deurali' means a pass or ridge with a small shrine where travellers leave offerings, which is why so many places in Nepal share the name.",
        "In January 2020 an avalanche between Deurali and Himalaya swept away a group of trekkers. Respect the snow warnings.",
        "Leave early. Snow that softens in the afternoon sun is what slides.",
        "Above 3,000 m, guidelines say to raise your sleeping altitude by no more than about 500 m a day. Deurali to ABC is about 900 m."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K, cold rooms",
        "network": "Paid Wi-Fi, unreliable",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "mbc": {
      "name": "Machhapuchhre Base Camp",
      "short": "MBC",
      "alt": 3700,
      "ll": [
        28.505,
        83.879
      ],
      "map": [
        848,
        150
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Wide meadow under the sheer face of Machhapuchhre, often a quieter and better acclimatised night than ABC.",
      "facts": [
        "Machhapuchhre (6,993 m) is closed to climbers. It is considered sacred to Shiva.",
        "In 1957 Wilfrid Noyce and David Cox stopped about 50 m below the summit, as they had promised, and no one has been allowed to climb it since.",
        "The name means 'fish tail', after its twin summit, which shows from the west."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1-1.5K",
        "network": "Paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Machapuchare"
    },
    "abc": {
      "name": "Annapurna Base Camp",
      "short": "ABC",
      "alt": 4130,
      "ll": [
        28.531,
        83.878
      ],
      "map": [
        842,
        84
      ],
      "label": "top",
      "region": "trek",
      "blurb": "The goal: a glacial amphitheatre ringed by Annapurna I, Annapurna South, Hiunchuli, Gangapurna and Machhapuchhre.",
      "facts": [
        "Annapurna I (8,091 m) was the first 8,000 m peak ever climbed, by Maurice Herzog and Louis Lachenal on 3 June 1950.",
        "Annapurna I is the 10th highest mountain on Earth, and for decades it had the highest death rate of all the 8,000ers.",
        "The huge south face above you was first climbed in 1970 by Chris Bonington's British expedition. Dougal Haston and Don Whillans reached the top.",
        "Memorial chortens here remember climbers lost on Annapurna, including Anatoli Boukreev, who died in 1997.",
        "Water boils at about 86 °C up here, so tea is cooler and noodles take longer."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1.5K, dorms in peak season",
        "network": "Paid Wi-Fi, sometimes NTC signal",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "jhinu": {
      "name": "Jhinu Danda",
      "short": "Jhinu",
      "alt": 1780,
      "ll": [
        28.404,
        83.821
      ],
      "map": [
        672,
        395
      ],
      "label": "left",
      "region": "trek",
      "blurb": "Village above natural hot springs by the Modi Khola: the best place to soak tired legs.",
      "facts": [
        "Natural hot springs sit by the river, about a 20-minute walk below the village.",
        "A long suspension bridge spans the Modi Khola nearby. Many bridges like it in the hills were built with help from the Kadoorie foundation.",
        "Jhinu sits below Chhomrong, so if you descend this way you skip the big staircase climb back up.",
        "It is a popular last night on the trail, which makes it a good place to celebrate."
      ],
      "notes": {
        "stay": "Teahouses ~INR 1K",
        "network": "Good 4G",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    },
    "motkyu": {
      "name": "Motkyu",
      "short": "Motkyu",
      "alt": 1450,
      "ll": [
        28.396,
        83.825
      ],
      "map": [
        735,
        420
      ],
      "label": "right",
      "region": "trek",
      "blurb": "New jeep road head about 30 minutes below Jhinu. Shared jeeps run from here to Pokhara.",
      "facts": [
        "The road reaching Motkyu means you no longer walk down to Siwai or Nayapul. The exit is now a short stroll and a jeep ride.",
        "The Modi Khola here is the same river you followed up to its glacier source at ABC.",
        "Shared jeeps fill up in the morning, so get there early for a seat on the 3-hour ride to Pokhara.",
        "Roads are pushing deeper into the Annapurna region every year, changing how the classic treks start and end."
      ],
      "notes": {
        "stay": "None. Ride on to Pokhara",
        "network": "OK",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Modi_Khola"
    },
    "ghorepani": {
      "name": "Ghorepani & Poon Hill",
      "short": "Poon Hill",
      "alt": 2860,
      "ll": [
        28.4005,
        83.7005
      ],
      "map": [
        430,
        398
      ],
      "label": "right",
      "region": "trek",
      "photo": "poonhill",
      "blurb": "Optional side loop: the dawn walk up Poon Hill (3,210 m) for one of Nepal's most famous sunrises.",
      "facts": [
        "From Poon Hill (3,210 m) you can see two 8,000 m giants at sunrise: Dhaulagiri (8,167 m) and Annapurna I.",
        "'Ghorepani' means 'horse water'. It was a watering stop for mule and horse caravans on the old trade route.",
        "The rhododendron forests around Ghorepani are among the most spectacular in Nepal in spring.",
        "Adding Poon Hill gives your legs a 2,800 to 3,200 m acclimatisation day before the Sanctuary."
      ],
      "notes": {
        "stay": "Many lodges",
        "network": "4G and Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Poon_Hill"
    },
    "tadapani": {
      "name": "Tadapani",
      "short": "Tadapani",
      "alt": 2630,
      "ll": [
        28.396,
        83.755
      ],
      "map": [
        555,
        412
      ],
      "label": "right",
      "region": "trek",
      "blurb": "Forest-ridge stop on the Poon Hill loop, linking Ghorepani to Chhomrong.",
      "facts": [
        "'Tadapani' means 'far water'. The village's water source was a long walk away.",
        "Sunrise from Tadapani lights up Annapurna South and Machhapuchhre right in front of you.",
        "The trail from Ghorepani passes Deurali pass (yes, another Deurali) through thick rhododendron forest.",
        "From Tadapani it's mostly downhill and then one climb to Chhomrong, where the loop rejoins the ABC trail."
      ],
      "notes": {
        "stay": "A few lodges",
        "network": "Patchy",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
    }
  },
  "trailLadder": [
    "kimche",
    "ghandruk",
    "chhomrong",
    "sinuwa",
    "bamboo",
    "dovan",
    "himalaya",
    "deurali",
    "mbc",
    "abc"
  ],
  "cards": {
    "arr-gop": {
      "title": "Bengaluru to Pokhara via Gorakhpur",
      "emoji": "🚌",
      "type": "transit",
      "from": "blr",
      "to": "pokhara",
      "comfort": 1,
      "legs": [
        [
          "blr",
          "gorakhpur",
          "flight",
          0,
          0,
          2.25,
          2.25,
          "IndiGo direct, 8:15 to 10:30"
        ],
        [
          "gorakhpur",
          "sonauli",
          "bus",
          100,
          100,
          3,
          3,
          "Bus or shared cab"
        ],
        [
          "sonauli",
          "bhairahawa",
          "walk",
          1,
          1,
          1,
          1.5,
          "Border crossing"
        ],
        [
          "bhairahawa",
          "pokhara",
          "bus",
          185,
          185,
          8,
          10,
          "Overnight bus"
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight BLR to GOP",
          8000,
          6000,
          12000
        ],
        [
          "cab",
          "Gorakhpur to Sonauli",
          1000,
          500,
          1500
        ],
        [
          "bus",
          "Bhairahawa to Pokhara bus",
          1500,
          650,
          1500
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ],
        [
          "misc",
          "Misc (plan rounding)",
          500,
          0,
          500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Take the overnight bus from Bhairahawa: it reaches Pokhara early the next morning, so there is no hotel to pay for tonight and day 2 starts in Pokhara."
        },
        {
          "lvl": "info",
          "t": "The ₹8,000 fare assumes booking 2 to 2.5 months ahead."
        },
        {
          "lvl": "info",
          "t": "A tourist bus from Bhairahawa to Pokhara is about NPR 1,000 to 1,500 (₹650 to ₹950). The plan's ₹1,500 is on the safe side."
        }
      ],
      "sleepNote": "night on the bus, in Pokhara by morning",
      "legLinks": {
        "2": [
          {
            "label": "Map: Sonauli border",
            "url": "https://maps.app.goo.gl/9Lsr9hypVT6P9wjM7"
          }
        ],
        "3": [
          {
            "label": "Map: Bhairahawa bus park",
            "url": "https://maps.app.goo.gl/JQtCnqsWsVnFQPwp6"
          },
          {
            "label": "Book on Bussewa",
            "url": "https://bussewa.com.np/"
          },
          {
            "label": "Book on GoMyGo",
            "url": "https://gomygo.com"
          }
        ]
      }
    },
    "arr-ktm-bus": {
      "title": "Fly to Kathmandu, bus to Pokhara",
      "emoji": "✈️",
      "type": "transit",
      "from": "blr",
      "to": "pokhara",
      "comfort": 2,
      "legs": [
        [
          "blr",
          "kathmandu",
          "flight",
          0,
          0,
          3,
          3,
          "Air India daily direct reported from 2026; else via Delhi"
        ],
        [
          "kathmandu",
          "pokhara",
          "bus",
          200,
          200,
          7,
          8,
          "Tourist bus"
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight BLR to KTM",
          15000,
          10000,
          22000
        ],
        [
          "bus",
          "Kathmandu to Pokhara bus",
          1500,
          650,
          1750
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Air India reportedly started a daily direct BLR-KTM flight in 2026 (early morning). Otherwise expect a stop in Delhi. Check before booking."
        },
        {
          "lvl": "info",
          "t": "Tourist buses leave Kathmandu around 7 am. Landing first means you may need the afternoon bus or a night in Kathmandu."
        }
      ],
      "legLinks": {
        "1": [
          {
            "label": "Book on Bussewa",
            "url": "https://bussewa.com.np/"
          },
          {
            "label": "Book on GoMyGo",
            "url": "https://gomygo.com"
          }
        ]
      }
    },
    "arr-ktm-fly": {
      "title": "Fly to Kathmandu, fly to Pokhara",
      "emoji": "🛫",
      "type": "transit",
      "from": "blr",
      "to": "pokhara",
      "comfort": 4,
      "legs": [
        [
          "blr",
          "kathmandu",
          "flight",
          0,
          0,
          3,
          3
        ],
        [
          "kathmandu",
          "pokhara",
          "flight",
          0,
          0,
          0.5,
          0.5,
          "Domestic flight"
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight BLR to KTM",
          15000,
          10000,
          22000
        ],
        [
          "flight2",
          "Flight KTM to PKR",
          5000,
          4000,
          7000
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ]
      ]
    },
    "arr-ktm": {
      "title": "Fly to Kathmandu",
      "type": "transit",
      "from": "blr",
      "to": "kathmandu",
      "comfort": 4,
      "legs": [
        [
          "blr",
          "kathmandu",
          "flight",
          0,
          0,
          3,
          3,
          "Direct, or via Delhi"
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight BLR to KTM",
          15000,
          10000,
          22000
        ],
        [
          "stay",
          "Stay in Kathmandu (Thamel)",
          1500,
          1000,
          2500
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Air India reportedly started a daily direct BLR to KTM flight in 2026. Otherwise expect a stop in Delhi. Check before booking."
        },
        {
          "lvl": "info",
          "t": "Stay in or near Thamel: it is walkable, has every budget, and is 20 minutes from the airport for the flight to Pokhara."
        }
      ]
    },
    "ktm-explore": {
      "title": "A day in Kathmandu",
      "type": "stay",
      "from": "kathmandu",
      "to": "kathmandu",
      "comfort": 4,
      "legs": [],
      "costs": [
        [
          "stay",
          "Stay in Kathmandu (Thamel)",
          1500,
          1000,
          2500
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ],
        [
          "sights",
          "Entry tickets and taxis",
          1500,
          800,
          2500
        ]
      ],
      "todo": [
        "Swayambhunath, the Monkey Temple, early in the morning",
        "Boudhanath, one of the largest stupas in the world",
        "Pashupatinath and the evening aarti on the Bagmati ghats",
        "Kathmandu Durbar Square and the Kumari Ghar",
        "Patan Durbar Square, if there is time, for the finest Newar architecture",
        "Thamel and Asan bazaar for last-minute trek gear"
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Get the ACAP permit today at the Nepal Tourism Board in Bhrikutimandap, so the first afternoon in Pokhara is free."
        },
        {
          "lvl": "info",
          "t": "Indian visitors pay the lower SAARC rate at most sites. Carry your passport or voter ID."
        }
      ],
      "costLinks": {
        "sights": [
          {
            "label": "Map: Tourism Board, Kathmandu",
            "url": "https://maps.app.goo.gl/1QCQ1dca2fxmDLDW7"
          }
        ]
      }
    },
    "pkr-arrive-fly": {
      "title": "Fly to Pokhara: permits and gear",
      "type": "transit",
      "from": "kathmandu",
      "to": "pokhara",
      "comfort": 4,
      "legs": [
        [
          "kathmandu",
          "pokhara",
          "flight",
          0,
          0,
          0.5,
          0.5,
          "Morning flight"
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight KTM to PKR",
          5000,
          4000,
          7000
        ],
        [
          "acap",
          "ACAP permit (buy in Kathmandu or online)",
          700,
          625,
          700
        ],
        [
          "tims",
          "TIMS card (likely not needed; check before you go)",
          0,
          0,
          700
        ],
        [
          "stay",
          "Stay",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ]
      ],
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas",
        "Davis Falls and Gupteshwor Cave, where the stream drops underground",
        "The International Mountain Museum, a good primer before the trek",
        "Sunrise over the Annapurnas from Sarangkot, or paraglide down from it"
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Take the first morning flight: the mountains are clearest early (sit on the right for the Himalaya) and later flights are the ones weather delays."
        },
        {
          "lvl": "info",
          "t": "In Pokhara by mid-morning: rent gear and stock up on cash, then the afternoon is yours."
        },
        {
          "lvl": "warn",
          "t": "Verify before you go: the TIMS card and Nepal's 2023 mandatory-guide rule have changed several times and are unevenly enforced. The ACAP permit is required everywhere, and costs double if you buy it at a check post."
        }
      ],
      "costLinks": {
        "acap": [
          {
            "label": "ACAP e-permit",
            "url": "http://epermit.ntnc.org.np"
          },
          {
            "label": "Map: Tourism Board, Pokhara",
            "url": "https://maps.app.goo.gl/uHJLVaCeL7mYE6PY9"
          },
          {
            "label": "Map: Tourism Board, Kathmandu",
            "url": "https://maps.app.goo.gl/1QCQ1dca2fxmDLDW7"
          }
        ]
      }
    },
    "pkr-arrive-bus": {
      "title": "Bus to Pokhara: permits and gear",
      "type": "transit",
      "from": "kathmandu",
      "to": "pokhara",
      "comfort": 2,
      "legs": [
        [
          "kathmandu",
          "pokhara",
          "bus",
          200,
          200,
          7,
          8,
          "Tourist bus, leaves around 7 am"
        ]
      ],
      "costs": [
        [
          "bus",
          "Kathmandu to Pokhara bus",
          1500,
          650,
          1750
        ],
        [
          "acap",
          "ACAP permit (buy in Kathmandu or online)",
          700,
          625,
          700
        ],
        [
          "tims",
          "TIMS card (likely not needed; check before you go)",
          0,
          0,
          700
        ],
        [
          "stay",
          "Stay",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ]
      ],
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas"
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "The bus reaches Pokhara mid-afternoon, so buy the ACAP permit in Kathmandu the day before (or online) and keep the evening for gear."
        },
        {
          "lvl": "warn",
          "t": "Verify before you go: the TIMS card and Nepal's 2023 mandatory-guide rule have changed several times and are unevenly enforced. The ACAP permit is required everywhere, and costs double if you buy it at a check post."
        }
      ],
      "legLinks": {
        "0": [
          {
            "label": "Book on Bussewa",
            "url": "https://bussewa.com.np/"
          },
          {
            "label": "Book on GoMyGo",
            "url": "https://gomygo.com"
          }
        ]
      },
      "costLinks": {
        "acap": [
          {
            "label": "ACAP e-permit",
            "url": "http://epermit.ntnc.org.np"
          },
          {
            "label": "Map: Tourism Board, Pokhara",
            "url": "https://maps.app.goo.gl/uHJLVaCeL7mYE6PY9"
          },
          {
            "label": "Map: Tourism Board, Kathmandu",
            "url": "https://maps.app.goo.gl/1QCQ1dca2fxmDLDW7"
          }
        ]
      }
    },
    "pkr-permits": {
      "title": "Pokhara: permits & rentals",
      "emoji": "📝",
      "type": "stay",
      "from": "pokhara",
      "to": "pokhara",
      "comfort": 4,
      "legs": [],
      "costs": [
        [
          "acap",
          "ACAP permit (SAARC rate NPR 1,000)",
          700,
          625,
          700
        ],
        [
          "tims",
          "TIMS card (likely not needed; check before you go)",
          0,
          0,
          700
        ],
        [
          "stay",
          "Stay",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "warn",
          "t": "Verify before you go: the TIMS card and Nepal's 2023 mandatory-guide rule have changed several times and are unevenly enforced. The ACAP permit is required everywhere, and costs double if you buy it at a check post."
        },
        {
          "lvl": "info",
          "t": "Get the ACAP permit online at epermit.ntnc.org.np or at the Nepal Tourism Board office in Pokhara. Bring passport photos."
        },
        {
          "lvl": "info",
          "t": "Permits and rentals take the morning. The rest of the day is free for Pokhara."
        }
      ],
      "costLinks": {
        "acap": [
          {
            "label": "ACAP e-permit",
            "url": "http://epermit.ntnc.org.np"
          },
          {
            "label": "Map: Tourism Board, Pokhara",
            "url": "https://maps.app.goo.gl/uHJLVaCeL7mYE6PY9"
          },
          {
            "label": "Map: Tourism Board, Kathmandu",
            "url": "https://maps.app.goo.gl/1QCQ1dca2fxmDLDW7"
          }
        ]
      },
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas",
        "Davis Falls and Gupteshwor Cave, where the stream drops underground",
        "The International Mountain Museum, a good primer before the trek",
        "Sunrise over the Annapurnas from Sarangkot, or paraglide down from it"
      ]
    },
    "pkr-explore": {
      "title": "Free day in Pokhara",
      "emoji": "🛶",
      "type": "stay",
      "from": "pokhara",
      "to": "pokhara",
      "comfort": 4,
      "legs": [],
      "costs": [
        [
          "stay",
          "Stay",
          2000,
          1000,
          2000
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "A reward after the trek: Phewa Lake, the Peace Pagoda, a soak and a slow lunch. Paragliding, bungee and boating are not included; add them under Add ons to budget for them."
        }
      ],
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas",
        "Davis Falls and Gupteshwor Cave, where the stream drops underground",
        "The International Mountain Museum, a good primer before the trek",
        "Sunrise over the Annapurnas from Sarangkot, or paraglide down from it"
      ]
    },
    "up-kimche-ghandruk": {
      "title": "Jeep to Kimche, trek to Ghandruk",
      "emoji": "🚙",
      "type": "trek",
      "from": "pokhara",
      "to": "ghandruk",
      "comfort": 3,
      "legs": [
        [
          "pokhara",
          "kimche",
          "jeep",
          50,
          50,
          3,
          3,
          "Shared or private jeep"
        ],
        [
          "kimche",
          "ghandruk",
          "trek",
          3.5,
          4,
          1,
          1.5
        ]
      ],
      "costs": [
        [
          "jeep",
          "Jeep Pokhara to Kimche",
          1000,
          800,
          1500
        ],
        [
          "stay",
          "Gurung Cottage",
          2000,
          1000,
          2500
        ],
        [
          "food",
          "Food & misc",
          1500,
          1200,
          2000
        ]
      ],
      "costLinks": {
        "stay": [
          {
            "label": "Map: Gurung Cottage",
            "url": "https://maps.app.goo.gl/zZSfvuDq6Cj2CVVq9"
          }
        ]
      }
    },
    "up-ghandruk-chhomrong": {
      "title": "Ghandruk to Chhomrong",
      "emoji": "🥾",
      "type": "trek",
      "from": "ghandruk",
      "to": "chhomrong",
      "comfort": 3,
      "legs": [
        [
          "ghandruk",
          "chhomrong",
          "trek",
          8,
          11,
          4,
          5.5
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          2500
        ]
      ]
    },
    "up-chhomrong-dovan": {
      "title": "Chhomrong to Dovan via Sinuwa & Bamboo",
      "emoji": "🥾",
      "type": "trek",
      "from": "chhomrong",
      "to": "dovan",
      "comfort": 3,
      "legs": [
        [
          "chhomrong",
          "dovan",
          "trek",
          9,
          11,
          5.5,
          7,
          "Via Sinuwa and Bamboo"
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          3000
        ]
      ]
    },
    "up-dovan-deurali": {
      "title": "Dovan to Deurali via Himalaya",
      "emoji": "🥾",
      "type": "trek",
      "from": "dovan",
      "to": "deurali",
      "comfort": 3,
      "legs": [
        [
          "dovan",
          "deurali",
          "trek",
          6,
          8,
          4,
          5,
          "Via Himalaya"
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2500,
          2000,
          3000
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Sleeping gain is about 630 m (2,600 to 3,230 m), slightly over the 500 m guideline. Go slowly and drink plenty."
        },
        {
          "lvl": "warn",
          "t": "February and March are peak avalanche season between Himalaya and MBC, around Hinku Cave. Start early and be through that stretch before 10 to 11 am. After fresh snow, ask at the lodge whether the trail is open before you set off."
        }
      ]
    },
    "up-ghandruk-sinuwa": {
      "title": "Ghandruk to Upper Sinuwa (fast)",
      "emoji": "⚡",
      "type": "trek",
      "from": "ghandruk",
      "to": "sinuwa",
      "comfort": 2,
      "legs": [
        [
          "ghandruk",
          "sinuwa",
          "trek",
          12,
          14,
          6,
          8,
          "Via Chhomrong"
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          2500
        ]
      ]
    },
    "up-sinuwa-deurali": {
      "title": "Upper Sinuwa to Deurali (fast)",
      "emoji": "⚡",
      "type": "trek",
      "from": "sinuwa",
      "to": "deurali",
      "comfort": 2,
      "legs": [
        [
          "sinuwa",
          "deurali",
          "trek",
          9,
          11,
          6,
          8,
          "Via Bamboo, Dovan, Himalaya"
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2500,
          2000,
          3000
        ]
      ],
      "tips": [
        {
          "lvl": "warn",
          "t": "About 870 m of sleeping gain to above 3,000 m, followed by another 900 m the next day. That is fast for most bodies, so watch for AMS symptoms."
        },
        {
          "lvl": "warn",
          "t": "This day crosses the Himalaya to Deurali stretch, the start of the avalanche zone. In February and March, plan to be past Hinku Cave before 10 to 11 am, and ask at the lodge after fresh snow."
        }
      ]
    },
    "top-deurali-abc": {
      "title": "Deurali to ABC via MBC",
      "emoji": "🏔️",
      "type": "trek",
      "from": "deurali",
      "to": "abc",
      "comfort": 2,
      "legs": [
        [
          "deurali",
          "abc",
          "trek",
          8,
          8,
          4,
          6,
          "Via MBC"
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse at ABC",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food & misc",
          3000,
          2500,
          3500
        ]
      ],
      "tips": [
        {
          "lvl": "warn",
          "t": "About 900 m of extra sleeping height in one day (3,230 to 4,130 m), well over the usual 500 m guideline. Walk slowly, drink plenty, and go back down if a headache builds."
        },
        {
          "lvl": "warn",
          "t": "Leave Deurali early: the stretch to MBC crosses avalanche-prone slopes, at their worst in February and March, and snow loosens in the afternoon sun. Aim to reach MBC by about 10 am."
        }
      ]
    },
    "down-abc-bamboo": {
      "title": "ABC to Bamboo",
      "emoji": "⬇️",
      "type": "trek",
      "from": "abc",
      "to": "bamboo",
      "comfort": 2,
      "legs": [
        [
          "abc",
          "bamboo",
          "trek",
          15,
          17,
          6,
          8
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          2500
        ]
      ],
      "tips": [
        {
          "lvl": "warn",
          "t": "Watch the sunrise, then leave ABC promptly: you want to be down past Deurali and Hinku Cave, the avalanche zone, before 10 to 11 am, especially in February and March."
        }
      ]
    },
    "down-bamboo-jhinu": {
      "title": "Bamboo to Jhinu Danda",
      "emoji": "♨️",
      "type": "trek",
      "from": "bamboo",
      "to": "jhinu",
      "comfort": 3,
      "legs": [
        [
          "bamboo",
          "jhinu",
          "trek",
          8,
          10,
          4,
          5
        ]
      ],
      "costs": [
        [
          "stay",
          "Teahouse",
          1000,
          800,
          1500
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          2500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Save energy for the hot springs, about 20 minutes below the village."
        }
      ]
    },
    "down-jhinu-pokhara": {
      "title": "Jhinu to Motkyu, jeep to Pokhara",
      "emoji": "🚙",
      "type": "trek",
      "from": "jhinu",
      "to": "pokhara",
      "comfort": 3,
      "legs": [
        [
          "jhinu",
          "motkyu",
          "trek",
          1.5,
          2,
          0.5,
          0.5
        ],
        [
          "motkyu",
          "pokhara",
          "jeep",
          60,
          60,
          3,
          3,
          "Shared jeep"
        ]
      ],
      "costs": [
        [
          "jeep",
          "Shared jeep Motkyu to Pokhara",
          1000,
          800,
          1500
        ],
        [
          "stay",
          "Stay in Pokhara",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food & misc",
          1500,
          1200,
          2000
        ]
      ]
    },
    "down-bamboo-pokhara": {
      "title": "Bamboo to Pokhara in one go (fast)",
      "emoji": "⚡",
      "type": "trek",
      "from": "bamboo",
      "to": "pokhara",
      "comfort": 1,
      "legs": [
        [
          "bamboo",
          "motkyu",
          "trek",
          10,
          12,
          5,
          6,
          "Via Jhinu"
        ],
        [
          "motkyu",
          "pokhara",
          "jeep",
          60,
          60,
          3,
          3,
          "Shared jeep"
        ]
      ],
      "costs": [
        [
          "jeep",
          "Shared jeep Motkyu to Pokhara",
          1000,
          800,
          1500
        ],
        [
          "stay",
          "Stay in Pokhara",
          1500,
          1000,
          2000
        ],
        [
          "food",
          "Food & misc",
          1500,
          1200,
          2000
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Saves a day but means skipping the Jhinu hot springs and a 9-hour day."
        }
      ]
    },
    "buf-pokhara": {
      "title": "Spare day for the trek",
      "emoji": "⏳",
      "type": "stay",
      "from": "pokhara",
      "to": "pokhara",
      "comfort": 4,
      "legs": [],
      "costs": [
        [
          "stay",
          "Stay",
          1000,
          1000,
          2000
        ],
        [
          "food",
          "Food & misc",
          2000,
          1500,
          2500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Held back in case snow, rain or altitude slows the trek. If the trek runs to plan, it becomes an extra day in Pokhara."
        }
      ],
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas",
        "Davis Falls and Gupteshwor Cave, where the stream drops underground",
        "The International Mountain Museum, a good primer before the trek",
        "Sunrise over the Annapurnas from Sarangkot, or paraglide down from it"
      ]
    },
    "home-gop": {
      "title": "Night bus to the border, fly home",
      "type": "transit",
      "from": "pokhara",
      "to": "blr",
      "comfort": 1,
      "nightBefore": "night bus to the border",
      "legs": [
        [
          "pokhara",
          "bhairahawa",
          "bus",
          185,
          185,
          8,
          10,
          "Night bus, leaves Pokhara the evening before"
        ],
        [
          "bhairahawa",
          "sonauli",
          "walk",
          1,
          1,
          1,
          1.5,
          "Border crossing"
        ],
        [
          "sonauli",
          "gorakhpur",
          "bus",
          100,
          100,
          3,
          3,
          "Bus or shared cab"
        ],
        [
          "gorakhpur",
          "blr",
          "flight",
          0,
          0,
          2.5,
          2.5
        ]
      ],
      "costs": [
        [
          "bus",
          "Pokhara to Bhairahawa night bus",
          1500,
          650,
          1500
        ],
        [
          "cab",
          "Sonauli to Gorakhpur",
          1000,
          500,
          1500
        ],
        [
          "flight",
          "Flight GOP to BLR",
          8000,
          6000,
          12000
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "The night bus leaves Pokhara in the evening and reaches Bhairahawa early in the morning, so there is no hotel to pay for that night. Ask your Pokhara lodge for a late checkout or a place to leave your bags."
        },
        {
          "lvl": "info",
          "t": "Pick a GOP to BLR flight from early afternoon: after the night bus you still need to clear the border and do 3 hours of road."
        }
      ],
      "legLinks": {
        "0": [
          {
            "label": "Map: Bhairahawa bus park",
            "url": "https://maps.app.goo.gl/JQtCnqsWsVnFQPwp6"
          },
          {
            "label": "Book on Bussewa",
            "url": "https://bussewa.com.np/"
          },
          {
            "label": "Book on GoMyGo",
            "url": "https://gomygo.com"
          }
        ],
        "1": [
          {
            "label": "Map: Sonauli border",
            "url": "https://maps.app.goo.gl/9Lsr9hypVT6P9wjM7"
          }
        ]
      }
    },
    "home-ktm-direct": {
      "title": "Fly Pokhara to Kathmandu, connect home",
      "emoji": "🏠",
      "type": "transit",
      "from": "pokhara",
      "to": "blr",
      "comfort": 3,
      "legs": [
        [
          "pokhara",
          "kathmandu",
          "flight",
          0,
          0,
          0.5,
          0.5
        ],
        [
          "kathmandu",
          "blr",
          "flight",
          0,
          0,
          3,
          3
        ]
      ],
      "costs": [
        [
          "flight",
          "Flight PKR to KTM",
          5000,
          4000,
          7000
        ],
        [
          "flight2",
          "Flight KTM to BLR",
          15000,
          10000,
          22000
        ],
        [
          "food",
          "Food & misc",
          1000,
          800,
          1500
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "Book the Pokhara flight for the morning and leave at least 3 hours before the international flight; mountain flights get delayed by weather."
        }
      ]
    }
  },
  "addons": {
    "porter": {
      "title": "Porter",
      "emoji": "🎒",
      "per": "trekDay",
      "inr": 1700,
      "min": 1500,
      "max": 2000,
      "comfort": 1,
      "note": "Paid for every walking day, up and down: a porter from Pokhara walks the whole route with you and back. About NPR 2,500-3,000 a day, carries up to ~20 kg. Tip at the end.",
      "group": "On the trail"
    },
    "guide": {
      "title": "Licensed guide",
      "emoji": "🧭",
      "per": "trekDay",
      "inr": 2300,
      "min": 2000,
      "max": 2800,
      "comfort": 0.5,
      "note": "Paid for every walking day, like a porter. About NPR 3,500-4,500 a day. Check current rules on whether a guide is mandatory.",
      "group": "On the trail"
    },
    "rentals": {
      "title": "Gear rentals in Pokhara",
      "emoji": "🧥",
      "per": "trip",
      "inr": 1500,
      "min": 800,
      "max": 3000,
      "comfort": 0.3,
      "note": "Sleeping bag, down jacket, poles, microspikes. Roughly NPR 100-200 per item per day.",
      "group": "On the trail"
    },
    "extras": {
      "title": "Teahouse extras",
      "emoji": "🔌",
      "per": "trekDay",
      "inr": 300,
      "min": 150,
      "max": 500,
      "comfort": 0.3,
      "note": "Hot shower, charging, Wi-Fi, water refills: NPR 200-500 each.",
      "group": "On the trail"
    },
    "sim_ntc": {
      "title": "Nepal Telecom (NTC) SIM",
      "per": "trip",
      "inr": 600,
      "min": 300,
      "max": 1000,
      "comfort": 0.2,
      "note": "The one to get for this trek: NTC holds a signal further up the ABC trail than Ncell. SIM plus a data pack; buy at the airport or in Pokhara with your passport and a photo.",
      "group": "Staying connected"
    },
    "sim_ncell": {
      "title": "Ncell SIM",
      "per": "trip",
      "inr": 500,
      "min": 300,
      "max": 1000,
      "comfort": 0.1,
      "note": "Cheaper data and strong in Kathmandu and Pokhara, weaker higher on the trail. Tourist packs from about NPR 500 for 10 GB. Many trekkers carry both.",
      "group": "Staying connected"
    },
    "paraglide": {
      "title": "Paragliding at Sarangkot",
      "emoji": "🪂",
      "per": "trip",
      "inr": 6500,
      "min": 5000,
      "max": 9000,
      "comfort": 0,
      "note": "Tandem flight, about 20-30 minutes.",
      "group": "In Pokhara"
    },
    "bungee": {
      "title": "Bungee jump at Hemja",
      "per": "trip",
      "inr": 5000,
      "min": 4000,
      "max": 7000,
      "comfort": 0,
      "note": "A tower jump at Hemja, about 20 minutes' drive from Lakeside. Online prices for visitors run about US$ 46-68 with transport; ask for the SAARC rate.",
      "group": "In Pokhara"
    },
    "insurance": {
      "title": "Trek insurance with heli cover",
      "emoji": "🛡️",
      "per": "trip",
      "inr": 2500,
      "min": 1500,
      "max": 5000,
      "comfort": 0.3,
      "note": "Must cover trekking to ~4,200 m and helicopter evacuation. Many standard policies stop at 2,000-3,000 m.",
      "group": "Peace of mind"
    }
  },
  "checklist": [
    {
      "cat": "Documents",
      "items": [
        {
          "id": "id",
          "t": "Passport or voter ID (Indian citizens)"
        },
        {
          "id": "photos",
          "t": "4 passport photos for permits"
        },
        {
          "id": "acap",
          "t": "ACAP permit, printed"
        },
        {
          "id": "tims",
          "t": "TIMS card and guide rule: checked the current rules"
        },
        {
          "id": "tickets",
          "t": "Flight and bus tickets saved offline"
        }
      ]
    },
    {
      "cat": "Money",
      "items": [
        {
          "id": "npr",
          "t": "NPR cash for the whole trek (no ATMs on the trail)"
        },
        {
          "id": "inr",
          "t": "Small INR notes as backup"
        }
      ]
    },
    {
      "cat": "Gear",
      "rentable": true,
      "items": [
        {
          "id": "bag",
          "t": "Sleeping bag (rated -10 °C in winter)"
        },
        {
          "id": "down",
          "t": "Down jacket"
        },
        {
          "id": "spikes",
          "t": "Microspikes (Dec to Mar)"
        },
        {
          "id": "poles",
          "t": "Trekking poles"
        },
        {
          "id": "boots",
          "t": "Broken-in trekking shoes"
        },
        {
          "id": "layers",
          "t": "Thermals, fleece, rain shell"
        },
        {
          "id": "warm",
          "t": "Gloves, beanie, buff"
        },
        {
          "id": "light",
          "t": "Headlamp and spare batteries"
        },
        {
          "id": "sun",
          "t": "Sunglasses (UV), sunscreen, lip balm"
        },
        {
          "id": "water",
          "t": "Water bottle and purification tablets"
        },
        {
          "id": "power",
          "t": "Power bank (charging costs extra up high)"
        }
      ]
    },
    {
      "cat": "Health",
      "items": [
        {
          "id": "kit",
          "t": "First aid: blister kit, painkillers, ORS"
        },
        {
          "id": "fit",
          "t": "Training: stairs or hill hikes done"
        }
      ]
    },
    {
      "cat": "Optional",
      "items": [
        {
          "id": "ins",
          "t": "Travel insurance covering trekking to 4,200 m and helicopter evacuation",
          "optional": true
        }
      ]
    }
  ],
  "milestones": [
    {
      "d": 60,
      "t": "Start training: stairs or hill hikes two or three times a week",
      "link": "fit"
    },
    {
      "d": 75,
      "t": "Book flights, 2 to 2.5 months ahead. Watch fares from about 3 months out and book before the last 6 weeks.",
      "link": "tickets"
    },
    {
      "d": 30,
      "t": "Travel insurance with helicopter evacuation to 4,200 m",
      "link": "ins",
      "optional": true
    },
    {
      "d": 14,
      "t": "Get the ACAP e-permit and check the TIMS and guide rules",
      "link": "acap"
    },
    {
      "d": 7,
      "t": "Get NPR cash and print your documents",
      "link": "npr"
    },
    {
      "d": 3,
      "t": "Check the forecast and pack with the checklist"
    },
    {
      "d": 1,
      "t": "Save this page for offline from the ⋯ menu, and charge everything"
    }
  ],
  "climate": {
    "base": "pokhara",
    "max": [
      20,
      22,
      26,
      29,
      29,
      29,
      29,
      30,
      28,
      27,
      23,
      20
    ],
    "min": [
      7,
      8,
      12,
      16,
      19,
      21,
      22,
      21,
      20,
      16,
      11,
      8
    ],
    "rain": [
      23,
      26,
      54,
      101,
      289,
      609,
      879,
      832,
      618,
      216,
      26,
      17
    ]
  },
  "photoCredits": {
    "abc": [
      "Josep M. Gracia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:ABC_-_South_face_of_Annapurna_I_from_Annapurna_Base_Camp,_Nepal,_2016.jpg"
    ],
    "bamboo": [
      "MarijaGrujovska",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:ACAP_Forest.jpg"
    ],
    "bhairahawa": [
      "Alexey Komarov",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Siddharthanagar,_Nepal,_9_April_2019_1.jpg"
    ],
    "blr": [
      "Sameer2905",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Terminal_2_Departure_of_Kempegowda_International_Airport.jpg"
    ],
    "chhomrong": [
      "Pursob64",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Chhomrong_Village_View.jpg"
    ],
    "deurali": [
      "Josep M. Gracia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:ABC_-_Deurali_on_the_Annapurna_Base_Camp_trek,_Nepal,_2016.jpg"
    ],
    "dovan": [
      "Josep M. Gracia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:ABC_-_Mountain_lodge_between_Chhomrong_and_Deurali,_Nepal,_2016.jpg"
    ],
    "ghandruk": [
      "Hopingyousuf",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Ghandruk_Village,_Kaski.jpg"
    ],
    "gorakhpur": [
      "Benison P Baby",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Gorakhpur_Junction_railway_station.jpg"
    ],
    "himalaya": [
      "Josep M. Gracia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:ABC_-_Mountain_stream_between_Chhomrong_and_Deurali,_Nepal,_2016.jpg"
    ],
    "jhinu": [
      "Bijay Chaurasia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Jhinu_Danda_Bridge_(Kadoorie_Bridge)-1.jpg"
    ],
    "kathmandu": [
      "Vyacheslav Argenberg (edit: UnpetitproleX)",
      "CC BY 4.0",
      "https://commons.wikimedia.org/wiki/File:Kathmandu_Durbar_Square,_Shiva_Parvati_Temple,_Nepal_(edit).jpg"
    ],
    "kimche": [
      "Greg Willis",
      "CC BY-SA 2.0",
      "https://commons.wikimedia.org/wiki/File:Fields_near_Kimche_(4525310791).jpg"
    ],
    "lumbini": [
      "Rangan Datta Wiki",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Lumbini_Maya_Devi_Temple_1.jpg"
    ],
    "mbc": [
      "Jodhani.micky",
      "CC BY-SA 3.0",
      "https://commons.wikimedia.org/wiki/File:On_the_way_to_Machhapuchhre_Base_Camp_1.jpg"
    ],
    "motkyu": [
      "Gerd Eichmann",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Jhinudanda-Landruk-46-Modi_Khola-2013-gje.jpg"
    ],
    "pokhara": [
      "Vyacheslav Argenberg",
      "CC BY 4.0",
      "https://commons.wikimedia.org/wiki/File:Pokhara,_Phewa_Lake,_Nepal.jpg"
    ],
    "poonhill": [
      "Bijay Chaurasia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Annapurna-I,_Annapurna_South_and_Himchuli_from_Ghorepani_Poonhill.jpg"
    ],
    "sinuwa": [
      "Biman Shrestha",
      "CC BY-SA 3.0",
      "https://commons.wikimedia.org/wiki/File:Majestic_view_of_Machhapuchchhre_from_Sinuwa.jpg"
    ],
    "sonauli": [
      "Sanu N",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Nepal_India_Border_gate_Sonauli.jpg"
    ],
    "tadapani": [
      "Bijay Chaurasia",
      "CC BY-SA 4.0",
      "https://commons.wikimedia.org/wiki/File:Nepalese_Children_in_Tadapani,_Ghandruk-Nepal-4428.jpg"
    ]
  }
};
