/**
 * The ABC trek plan as data. Everything the app shows comes from here, so the
 * plan (a price, a new alternative, a story) changes without touching UI code.
 *
 * Costs are in INR: [id, label, default, min, max, opts?]. Without opts the
 * price is per person. With `per` and `cap` it is for one room or vehicle that
 * up to `cap` people share, and each person pays their share. With `road`, the
 * line only counts when the group goes by bus ("bus") or private car ("car").
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
  "home": {
    "id": "blr",
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
    "label": "right"
  },
  "places": {
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
      "origin": "Named after the yogi Gorakhnath, revered in the Nath tradition, whose temple here is its seat.",
      "facts": [
        "Gorakhpur Junction's 1,366 m platform was the world's longest from 2013 until Hubballi's roughly 1,505 m platform took the record in 2023.",
        "Gita Press, founded here in 1923, is one of the world's largest publishers of Hindu religious texts.",
        "Gorakhpur is the headquarters of Indian Railways' North Eastern Railway zone."
      ],
      "notes": {
        "stay": "Hotels near the station and airport",
        "network": "Full coverage",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Gorakhpur",
      "stories": [
        {
          "id": "gorakhpur",
          "title": "Chauri Chaura, 1922",
          "hook": "A burning police station near Gorakhpur made Gandhi call off India's first mass movement against British rule."
        }
      ]
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
      "wiki": "https://en.wikipedia.org/wiki/Sunauli",
      "stories": [
        {
          "id": "sonauli",
          "title": "An open border",
          "hook": "You can walk across this border without a visa because of a treaty signed in 1950, the same year Annapurna was climbed."
        }
      ]
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
      "origin": "Bhairahawa comes from Bhairav, a fierce form of Shiva once worshipped in the village, with the '-hawa' ending common to place names here. Its official name since 1977, Siddharthanagar, honours Siddhartha Gautama, the Buddha, born about 25 km away.",
      "facts": [
        "Gautam Buddha International Airport opened here in May 2022, making it Nepal's second international airport.",
        "The Siddhartha Highway to Pokhara climbs out of the flat Terai through the Mahabharat hills: you go from about 100 m to 822 m.",
        "The Terai plains around Bhairahawa are Nepal's rice bowl, a very different Nepal from the mountains you are heading to."
      ],
      "notes": {
        "stay": "Budget hotels near the bus park",
        "network": "Good 4G",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Siddharthanagar",
      "stories": [
        {
          "id": "bhairahawa",
          "title": "The Buddha's jewels",
          "hook": "A few kilometres from here, in 1898, a planter dug into a mound and found bones, an inscription and 1,800 gems. The fight over them ended only in 2025."
        }
      ]
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
      "origin": "The ancient name of the grove where the Buddha was born, written 'Lummini' on Ashoka's pillar. Where it comes from is uncertain: perhaps a princess or queen, perhaps a word for a flowering grove. The village name Rummindei grew out of it.",
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
      "wiki": "https://en.wikipedia.org/wiki/Lumbini",
      "stories": [
        {
          "id": "lumbini",
          "title": "The pillar and the forger",
          "hook": "The Buddha's birthplace was lost for centuries. The man credited with finding it turned out to be a forger."
        }
      ]
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
      "origin": "Thought to come from Kasthamandap, 'wooden shelter', a pavilion on Durbar Square said to have been built from the wood of a single tree.",
      "facts": [
        "The Kathmandu Valley has seven monument zones under a single UNESCO World Heritage listing, inscribed in 1979.",
        "The Kumari, a living goddess, lives in the Kumari Ghar on Kathmandu Durbar Square.",
        "Nepal's flag, two stacked pennants, is the only national flag in the world that is not a rectangle."
      ],
      "notes": {
        "stay": "Thamel has every budget",
        "network": "Good 4G",
        "atm": "Plenty"
      },
      "wiki": "https://en.wikipedia.org/wiki/Kathmandu",
      "stories": [
        {
          "id": "kathmandu",
          "title": "The year Nepal opened",
          "hook": "Until 1950 Nepal was almost closed to the world. Then the king drove into the Indian embassy and did not come out."
        },
        {
          "id": "kathmandu-2015",
          "title": "25 April 2015",
          "hook": "Just before noon on a Saturday, the ground shook for nearly a minute. Some of the towers and temples you will walk past are new."
        }
      ]
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
      "origin": "From pokhari, Nepali for pond: the valley is dotted with ponds and lakes.",
      "facts": [
        "Phewa Lake is Nepal's second-largest lake. The Tal Barahi temple sits on a small island in the middle of it.",
        "Machhapuchhre (6,993 m) stands just ~30 km from the city at 822 m, one of the steepest rises from a city to a summit anywhere.",
        "The Seti Gandaki river runs through gorges under the city that narrow to just a few metres in places.",
        "The International Mountain Museum documents the history of Himalayan mountaineering and the people of the mountains.",
        "Sarangkot, above the lake, is one of the world's most popular paragliding launch sites."
      ],
      "notes": {
        "stay": "Lakeside guesthouses INR 1-2K a room",
        "network": "Good 4G, fast Wi-Fi",
        "atm": "Plenty. Treat Pokhara as your last reliable ATM."
      },
      "wiki": "https://en.wikipedia.org/wiki/Pokhara",
      "links": [
        {
          "label": "Nepal Tourism Board, Pokhara (permits)",
          "url": "https://maps.app.goo.gl/uHJLVaCeL7mYE6PY9"
        }
      ],
      "stories": [
        {
          "id": "pokhara",
          "title": "The doko race",
          "hook": "Every year thousands of young Nepalis race uphill outside Pokhara with 25 kg on their backs, for a place in the Gurkhas."
        },
        {
          "id": "pokhara-airport",
          "title": "The 48-year airport",
          "hook": "The land for Pokhara's international airport was bought in 1975. The first plane landed in 2023, and the bill is still coming in."
        },
        {
          "id": "pokhara-seti",
          "title": "The Seti flood, 2012",
          "hook": "On a dry May morning in 2012, a wall of mud came down the river under Pokhara, from a collapse high on Annapurna IV."
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
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": []
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
        "stay": "Gurung Cottage and many lodges, about INR 1.5K a person",
        "network": "Good 4G",
        "atm": "Do not count on it"
      },
      "wiki": "https://en.wikipedia.org/wiki/Ghandruk",
      "links": [
        {
          "label": "Gurung Cottage",
          "url": "https://maps.app.goo.gl/zZSfvuDq6Cj2CVVq9"
        }
      ],
      "stories": [
        {
          "id": "ghandruk",
          "title": "The Tamu village",
          "hook": "Ghandruk is a Gurung village, and the place where Nepal tried a new idea: a protected area people still live in."
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
        "stay": "Teahouse rooms ~NPR 500-1,000",
        "network": "4G patchy, paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Chhomrong",
      "stories": [
        {
          "id": "chhomrong",
          "title": "The man who invented trekking",
          "hook": "The idea that anyone can walk to a place like this, with porters and lodges, started with one British officer."
        }
      ]
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
        "stay": "Teahouse rooms ~NPR 500-1,000",
        "network": "Patchy",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": []
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
      "origin": "Named for the dense bamboo forest around the lodges.",
      "facts": [
        "The gorge is so deep that the sun reaches the lodges late and leaves early, so it gets cold quickly in the evening.",
        "There are only a handful of lodges, so in peak season (Oct to Nov, Mar to Apr) they fill up early in the day.",
        "Above Bamboo, food prices climb with every hour of trail because everything is carried up by porters or mules."
      ],
      "notes": {
        "stay": "Few lodges, book early in peak season",
        "network": "Weak",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": [
        {
          "id": "bamboo",
          "title": "Mad honey",
          "hook": "On cliffs in these hills live the world's largest honey bees, and Gurung hunters climb rope ladders for a honey that can make you hallucinate."
        }
      ]
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
      "origin": "From dobhan, Nepali for a confluence: side streams meet the Modi Khola here.",
      "facts": [
        "Between Dovan and Himalaya the forest changes from bamboo to oak and rhododendron.",
        "In monsoon and after rain, tall waterfalls stream off the cliffs above the lodges.",
        "The roar you hear all night is the Modi Khola, fed by Annapurna's glaciers."
      ],
      "notes": {
        "stay": "Teahouse rooms ~NPR 500-1,000",
        "network": "Weak, paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Modi_Khola",
      "stories": []
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
      "origin": "Named after its first lodge, the Himalaya Hotel. It is a lodge stop, not a village.",
      "facts": [
        "Just above is Hinku Cave, an overhanging rock once used as shelter by shepherds and early expeditions.",
        "Between Himalaya and MBC the trail crosses avalanche chutes, so after heavy snow, ask the lodges before you go on.",
        "Snow can linger in the gullies here well into spring."
      ],
      "notes": {
        "stay": "Teahouse rooms ~NPR 500-1,000",
        "network": "Weak",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": [
        {
          "id": "himalaya",
          "title": "The sacred basin",
          "hook": "Above here the gorge opens into a place the Gurungs believed was full of gods and guarded treasure. Outsiders first walked in only in 1956."
        }
      ]
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
      "origin": "Deurali means a pass or ridge with a small shrine where travellers leave offerings, which is why so many places in Nepal share the name.",
      "facts": [
        "In January 2020 an avalanche between Deurali and Himalaya swept away a group of trekkers. Respect the snow warnings.",
        "Leave early. Snow that softens in the afternoon sun is what slides.",
        "Above 3,000 m, guidelines say to raise your sleeping altitude by no more than about 500 m a day. Deurali to ABC is about 900 m."
      ],
      "notes": {
        "stay": "Teahouse rooms ~NPR 500-1,000, cold",
        "network": "Paid Wi-Fi, unreliable",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": [
        {
          "id": "deurali",
          "title": "January 2020",
          "hook": "The gully above Deurali is where an avalanche buried seven people in 2020. Why the snow warnings matter."
        }
      ]
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
      "origin": "Machhapuchhre means 'fish tail' (machha, fish; puchhre, tail), after its twin summit, which shows from the west.",
      "facts": [
        "Machhapuchhre (6,993 m) is closed to climbers. It is considered sacred to Shiva.",
        "In 1957 Wilfrid Noyce and David Cox stopped about 50 m below the summit, as they had promised, and no one has been allowed to climb it since."
      ],
      "notes": {
        "stay": "Teahouse rooms ~NPR 800-1,500",
        "network": "Paid Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Machapuchare",
      "stories": [
        {
          "id": "mbc",
          "title": "The mountain no one may climb",
          "hook": "In 1957 two climbers stopped 150 ft below this summit. Nobody has been allowed to try since."
        }
      ]
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
      "origin": "Annapurna is Sanskrit: anna, food, and purna, full. It is the name of the Hindu goddess of food and nourishment, a form of Parvati.",
      "facts": [
        "Annapurna I (8,091 m) was the first 8,000 m peak ever climbed, by Maurice Herzog and Louis Lachenal on 3 June 1950.",
        "Annapurna I is the 10th highest mountain on Earth, and for decades it had the highest death rate of all the 8,000ers.",
        "The huge south face above you was first climbed in 1970 by Chris Bonington's British expedition. Dougal Haston and Don Whillans reached the top.",
        "Memorial chortens here remember climbers lost on Annapurna, including Anatoli Boukreev, who died in 1997.",
        "Water boils at about 86 °C up here, so tea is cooler and noodles take longer."
      ],
      "notes": {
        "stay": "Rooms ~NPR 1,000-2,000, dorms in peak season",
        "network": "Paid Wi-Fi, sometimes NTC signal",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": [
        {
          "id": "abc",
          "title": "Annapurna, 1950",
          "hook": "In 1950 nobody had climbed an 8,000 m peak. A French team picked this one, and the climb nearly killed them."
        },
        {
          "id": "abc-boukreev",
          "title": "Boukreev, 1997",
          "hook": "One of the memorials here is for the climber who went back out alone into the 1996 Everest storm, and died on this mountain the next winter."
        }
      ]
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
      "origin": "Danda is Nepali for a ridge or hill, which is where the village sits. Where 'Jhinu' comes from is not recorded.",
      "facts": [
        "Natural hot springs sit by the river, about a 20-minute walk below the village.",
        "A long suspension bridge spans the Modi Khola nearby. Many bridges like it in the hills were built with help from the Kadoorie foundation.",
        "Jhinu sits below Chhomrong, so if you descend this way you skip the big staircase climb back up.",
        "It is a popular last night on the trail, which makes it a good place to celebrate."
      ],
      "notes": {
        "stay": "Teahouse rooms ~NPR 500-1,000",
        "network": "Good 4G",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": []
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
      "wiki": "https://en.wikipedia.org/wiki/Modi_Khola",
      "stories": []
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
      "origin": "Ghorepani means 'horse water' (ghoda, horse; pani, water): traders watered their horses here. Poon Hill above is really Pun Hill, named for the Pun Magars who live on its slopes.",
      "facts": [
        "From Poon Hill (3,210 m) you can see two 8,000 m giants at sunrise: Dhaulagiri (8,167 m) and Annapurna I.",
        "The rhododendron forests around Ghorepani are among the most spectacular in Nepal in spring.",
        "Adding Poon Hill gives your legs a 2,800 to 3,200 m acclimatisation day before the Sanctuary."
      ],
      "notes": {
        "stay": "Many lodges",
        "network": "4G and Wi-Fi",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Poon_Hill",
      "stories": [
        {
          "id": "ghorepani",
          "title": "Pun Hill",
          "hook": "The most famous sunrise in Nepal is named after the people who live here, the Pun Magars. One of them won the Victoria Cross."
        }
      ]
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
      "origin": "Tadapani means 'far water' (tada, far; pani, water): the village's water source was a long walk away.",
      "facts": [
        "Sunrise from Tadapani lights up Annapurna South and Machhapuchhre right in front of you.",
        "The trail from Ghorepani passes Deurali pass (yes, another Deurali) through thick rhododendron forest.",
        "From Tadapani it's mostly downhill and then one climb to Chhomrong, where the loop rejoins the ABC trail."
      ],
      "notes": {
        "stay": "A few lodges",
        "network": "Patchy",
        "atm": "No"
      },
      "wiki": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary",
      "stories": []
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
          "sonauli-bus",
          "Bus Gorakhpur to Sonauli",
          200,
          130,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "sonauli-cab",
          "Taxi Gorakhpur to Sonauli",
          3000,
          2500,
          4000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "auto",
          "Auto from the border to Bhairahawa bus park",
          200,
          150,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "bus",
          "VIP sofa bus Bhairahawa to Pokhara (overnight)",
          1200,
          950,
          1500,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private car Bhairahawa to Pokhara",
          12000,
          10000,
          15000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "local",
          "Local bus or ride-hail, bus park to Lakeside",
          150,
          100,
          300,
          {
            "road": "bus"
          }
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
          "t": "Take the overnight bus from Bhairahawa: it reaches Pokhara early the next morning, so there is no hotel to pay for tonight and day 2 starts in Pokhara."
        },
        {
          "lvl": "info",
          "t": "The ₹8,000 fare assumes booking 2 to 2.5 months ahead."
        },
        {
          "lvl": "info",
          "t": "A VIP sofa bus from Bhairahawa to Pokhara is about NPR 1,500 to 2,400 (₹950 to ₹1,500). For four people, a private car is about ₹3,000 each: more than double the bus, but door to door. Switch with Getting around."
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
          8,
          "Direct about 3 h, via Delhi 6 to 8 h"
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
          "local",
          "Local bus or ride-hail: airport to bus park, bus park to Lakeside",
          350,
          200,
          600,
          {
            "road": "bus"
          }
        ],
        [
          "bus",
          "Tourist sofa bus Kathmandu to Pokhara",
          1500,
          1100,
          2200,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private car Kathmandu to Pokhara",
          14000,
          11000,
          17000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
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
          "t": "Tourist buses leave Kathmandu around 7 am, and a flight via Delhi lands in the afternoon at best. Expect the afternoon bus into Pokhara late at night, or turn on A day in Kathmandu and take the morning bus."
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
          8,
          "Direct about 3 h, via Delhi 6 to 8 h"
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
          "local",
          "Local bus or ride-hail, Pokhara airport to Lakeside",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxi, Pokhara airport to Lakeside",
          400,
          300,
          600,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
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
          "t": "Pick a Bengaluru flight that lands in Kathmandu by early afternoon, so you can still make one of the last flights to Pokhara. Via Delhi that usually means leaving Bengaluru early in the morning. If it lands later, turn on A day in Kathmandu and spend the night there."
        }
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
          8,
          "Direct about 3 h, via Delhi 6 to 8 h"
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
          "local",
          "Local bus or ride-hail, airport to Thamel",
          200,
          100,
          350,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxi, airport to Thamel",
          600,
          450,
          900,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "stay",
          "Stay in Kathmandu (Thamel)",
          2000,
          1200,
          3000,
          {
            "per": "room",
            "cap": 2,
            "full": 2500
          }
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
          2000,
          1200,
          3000,
          {
            "per": "room",
            "cap": 2,
            "full": 2500
          }
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
          "Entry tickets (SAARC rates)",
          500,
          300,
          900
        ],
        [
          "local",
          "Local buses and ride-hail between the sights",
          300,
          200,
          500,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxis between the sights",
          1200,
          800,
          1800,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
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
          "local",
          "Local bus or ride-hail: Thamel to the airport, airport to Lakeside",
          350,
          200,
          600,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxis: Thamel to the airport, airport to Lakeside",
          900,
          700,
          1200,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "acap",
          "ACAP permit (SAARC rate NPR 1,000; double at a check post)",
          625,
          625,
          1250
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
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
          "Tourist sofa bus Kathmandu to Pokhara",
          1500,
          1100,
          2200,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private car Kathmandu to Pokhara",
          14000,
          11000,
          17000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "local",
          "Walk or local bus, bus park to Lakeside",
          150,
          0,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "acap",
          "ACAP permit (SAARC rate NPR 1,000; double at a check post)",
          625,
          625,
          1250
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
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
          "ACAP permit (SAARC rate NPR 1,000; double at a check post)",
          625,
          625,
          1250
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
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
        ],
        [
          "food",
          "Food",
          1000,
          800,
          1500
        ],
        [
          "local",
          "Local buses and walking",
          200,
          100,
          400,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxis around Pokhara",
          1000,
          700,
          1500,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
        ]
      ],
      "tips": [
        {
          "lvl": "info",
          "t": "A reward after the trek: Phewa Lake, the Peace Pagoda, a soak and a slow lunch. Paragliding and bungee are under Add ons; a rowing boat on Phewa is extra, about NPR 800 to 1,000 an hour."
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
          "local",
          "Local bus or ride-hail to the jeep stand",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "jeep",
          "Shared jeep Pokhara to Kimche",
          1000,
          800,
          1500,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private jeep Pokhara to Kimche",
          8000,
          6500,
          10000,
          {
            "per": "jeep",
            "cap": 6,
            "road": "car"
          }
        ],
        [
          "stay",
          "Lodge in Ghandruk",
          1500,
          1200,
          2000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
          2000,
          1600,
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
      "via": ["sinuwa", "bamboo"],
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
          2200,
          1800,
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
      "via": ["himalaya"],
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
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
      "via": ["chhomrong"],
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
          2200,
          1800,
          2800
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
      "via": ["bamboo", "dovan", "himalaya"],
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
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
      "via": ["mbc"],
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
          "Teahouse at ABC, half a twin room",
          800,
          625,
          1200
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
          2300,
          1800,
          2800
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
          "Teahouse, half a twin room",
          650,
          625,
          1000
        ],
        [
          "food",
          "Food & misc (incl. hot water, charging)",
          2000,
          1600,
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
          1500,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private jeep Motkyu to Pokhara",
          8000,
          6500,
          10000,
          {
            "per": "jeep",
            "cap": 6,
            "road": "car"
          }
        ],
        [
          "local",
          "Local bus or ride-hail, bus park to Lakeside",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "stay",
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
      "via": ["jhinu"],
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
          1500,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private jeep Motkyu to Pokhara",
          8000,
          6500,
          10000,
          {
            "per": "jeep",
            "cap": 6,
            "road": "car"
          }
        ],
        [
          "local",
          "Local bus or ride-hail, bus park to Lakeside",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "stay",
          "Stay in Pokhara (Lakeside)",
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
          1500,
          1000,
          2500,
          {
            "per": "room",
            "cap": 2,
            "full": 2000
          }
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
    "pkr-depart": {
      "title": "Last day in Pokhara, night bus out",
      "emoji": "🌙",
      "type": "stay",
      "from": "pokhara",
      "to": "pokhara",
      "comfort": 4,
      "legs": [],
      "costs": [
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
          "t": "A night in a bed after coming down, then a slow day before the night bus to the border this evening. Check out in the morning and leave your bags at the lodge."
        }
      ],
      "todo": [
        "Walk the Lakeside promenade along Phewa Lake at sunset",
        "Row or take a boat to the Tal Barahi temple on its island",
        "Climb to the World Peace Pagoda for the view back over the lake to the Annapurnas",
        "Davis Falls and Gupteshwor Cave, where the stream drops underground"
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
          "local",
          "Local bus or ride-hail, Lakeside to the bus park",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "bus",
          "VIP sofa night bus Pokhara to Bhairahawa",
          1200,
          950,
          1500,
          {
            "road": "bus"
          }
        ],
        [
          "auto",
          "Auto from Bhairahawa to the border",
          200,
          150,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "sonauli-bus",
          "Bus Sonauli to Gorakhpur",
          200,
          130,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "car",
          "Private car Pokhara to the border",
          12000,
          10000,
          15000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
        ],
        [
          "sonauli-cab",
          "Taxi Sonauli to Gorakhpur",
          3000,
          2500,
          4000,
          {
            "per": "car",
            "cap": 4,
            "road": "car"
          }
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
        },
        {
          "lvl": "info",
          "t": "Going by private car instead of the night bus? Drive by day: leave Pokhara before dawn for an afternoon flight, and it is still 7 to 8 hours to the border."
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
          8,
          "Direct about 3 h, via Delhi 6 to 8 h"
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
          "local",
          "Local bus or ride-hail to Pokhara airport",
          150,
          100,
          300,
          {
            "road": "bus"
          }
        ],
        [
          "taxi",
          "Taxi, Lakeside to Pokhara airport",
          400,
          300,
          600,
          {
            "per": "taxi",
            "cap": 4,
            "road": "car"
          }
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
      "note": "Paid for every walking day, up and down: a porter from Pokhara walks the whole route with you and back. About NPR 2,500-3,000 a day and carries up to ~20 kg, usually for two people, so two of you share one.",
      "group": "On the trail",
      "unit": "porter",
      "cap": 2
    },
    "guide": {
      "title": "Licensed guide",
      "emoji": "🧭",
      "per": "trekDay",
      "inr": 2300,
      "min": 2000,
      "max": 2800,
      "comfort": 0.5,
      "note": "Paid for every walking day, like a porter. About NPR 3,500-4,500 a day for one guide, shared by the whole group. Optional on this trail in practice.",
      "group": "On the trail",
      "unit": "guide",
      "cap": 8
    },
    "rentals": {
      "title": "Gear rentals in Pokhara",
      "emoji": "🧥",
      "per": "trekDay",
      "inr": 350,
      "min": 200,
      "max": 500,
      "comfort": 0.3,
      "note": "Sleeping bag, down jacket, poles, microspikes. Rental bags are often old and flatter than their label, so pick one labelled -15 °C or colder. Roughly NPR 100-200 per item per day, so about NPR 400-800 a day for the set.",
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
      "inr": 5000,
      "min": 3500,
      "max": 8000,
      "comfort": 0.3,
      "note": "Must cover trekking to ~4,200 m and helicopter evacuation, which alone can cost US$ 3,000-5,000. Many standard policies stop at 2,000-3,000 m, so check the altitude limit in writing.",
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
          "t": "Sleeping bag, comfort rated -10 °C (Dec to Mar), plus a liner"
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
      "id": "ms-forecast",
      "t": "Check the forecast and pack with the checklist"
    },
    {
      "d": 1,
      "id": "ms-offline",
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
