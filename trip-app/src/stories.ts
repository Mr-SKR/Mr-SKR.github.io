/**
 * The long reads behind each place's story, keyed by place id. The title and
 * hook stay in data.ts for the route; these are only needed once a place sheet
 * opens, so they load as their own chunk.
 */
import type { StoryBody } from "./types";

export const STORIES: Record<string, StoryBody> = {
  "gorakhpur": {
    "parts": [
      {
        "h": "4 February 1922",
        "p": [
          "In 1922 Gandhi's non-cooperation movement was sweeping India: boycotts, strikes and marches, all meant to be strictly non-violent. At Chauri Chaura, a market town about 25 km from Gorakhpur, police beat protesters and then fired on a crowd of them. The crowd turned on the police station and set it alight. Twenty-two policemen died, along with three protesters."
        ]
      },
      {
        "h": "Gandhi stops",
        "p": [
          "Gandhi was shocked. On 12 February, against the wishes of many leaders who thought the British were close to giving way, he called the whole movement off and fasted for five days in penance. Weeks later he was arrested and jailed.",
          "Historians still argue whether he was right. But Chauri Chaura shaped everything that followed: Gandhi would not lead another mass campaign until he believed it could stay non-violent, and the next one, the Salt March, came eight years later."
        ]
      }
    ],
    "sources": [
      {
        "label": "Chauri Chaura incident",
        "url": "https://en.wikipedia.org/wiki/Chauri_Chaura_incident"
      }
    ]
  },
  "sonauli": {
    "parts": [
      {
        "h": "The 1950 treaty",
        "p": [
          "On 31 July 1950 India and Nepal signed the Treaty of Peace and Friendship. Among other things, each country agreed to give the other's citizens the same right to live, work, own property and do business as its own.",
          "The result is one of the most open borders in the world, about 1,750 km long. Indians and Nepalis cross it with no visa and often no paperwork at all, which is why Sonauli feels more like one long market street than a frontier."
        ]
      },
      {
        "h": "Why it matters",
        "p": [
          "Millions of Nepalis work in India, and Nepali Gorkhas serve in the Indian Army. Families, trade and festivals run across the line. For you it means a stamp-free walk into Nepal, and a reminder to keep your passport or voter ID handy anyway: you will need it for the trek permit."
        ]
      }
    ],
    "sources": [
      {
        "label": "1950 Indo-Nepal Treaty of Peace and Friendship",
        "url": "https://en.wikipedia.org/wiki/1950_Indo-Nepal_Treaty_of_Peace_and_Friendship"
      }
    ]
  },
  "bhairahawa": {
    "parts": [
      {
        "h": "The mound at Piprahwa",
        "p": [
          "In 1896 the Ashoka pillar at Lumbini was dug out, just west of here. Across the border in India, William Claxton Peppé, a British landowner, took note. On his estate at Piprahwa stood a large brick mound, and in January 1898 his workers cut a trench through some 18 feet of solid brickwork into it.",
          "At the bottom was a stone coffer. Inside were vases holding fragments of bone and ash, and around 1,800 gems, pearls and pieces of worked gold."
        ]
      },
      {
        "h": "What the vase said",
        "p": [
          "One vase carried a line in ancient Brahmi script. Most scholars read it as a relic shrine of the Buddha of the Sakyas, his own clan, the gift of the brothers of Sukiti with their sisters, sons and wives. If so, these were part of the Buddha's own ashes, the Sakya share after his cremation.",
          "Within months the Lumbini forger scandal broke: Führer, the archaeologist credited with finding the pillar, was exposed as a faker of relics. The Piprahwa find was doubted along with everything near it, and the readings were fought over for years. Today leading specialists accept the inscription as genuine. Later digs here by the Archaeological Survey of India, in the 1970s, are why some scholars place the Buddha's home town, Kapilavastu, at Piprahwa; others put it at Tilaurakot, in Nepal."
        ]
      },
      {
        "h": "Scattered, and brought back",
        "p": [
          "In 1899 the bones were given to King Rama V of Siam and shared among Buddhist temples across Asia. Most of the jewels went to the Indian Museum in Kolkata. The Peppé family kept some.",
          "In 2025 Sotheby's planned to auction the family's gems in Hong Kong. India sent a legal notice calling for their return, and the sale was postponed. In July the gems were bought by the Indian Godrej group and returned to India to go on public display."
        ]
      },
      {
        "h": "The airport that waited",
        "p": [
          "Bhairahawa's own modern story is its airport. Plans to make it Nepal's second international airport began in 2013, aiming for 2017. The 2015 earthquake, a border blockade and then COVID pushed it back, and the first international flight landed only in May 2022. By the end of that year winter fog and thin demand had stopped every international service, and keeping foreign airlines here has been a struggle ever since."
        ]
      }
    ],
    "sources": [
      {
        "label": "Piprahwa",
        "url": "https://en.wikipedia.org/wiki/Piprahwa"
      },
      {
        "label": "NBC News: relics returned to India",
        "url": "https://www.nbcnews.com/world/asia/ancient-buddha-relics-sold-india-13-million-auction-postponed-rcna222148"
      },
      {
        "label": "Gautam Buddha International Airport",
        "url": "https://en.wikipedia.org/wiki/Gautam_Buddha_International_Airport"
      },
      {
        "label": "Himalayan Times: flights suspended",
        "url": "https://thehimalayantimes.com/nepal/suspension-of-flights-from-gbia-hits-businesses"
      }
    ]
  },
  "lumbini": {
    "parts": [
      {
        "h": "A lost place",
        "p": [
          "Around 249 BCE the emperor Ashoka came to Lumbini and raised a stone pillar. Its inscription says the Buddha Shakyamuni was born here, and that Ashoka freed the village from tax but for an eighth share of its crop. Chinese pilgrims still found the pillar in the 7th century. Then the jungle took the site, and for over a thousand years nobody knew exactly where it was."
        ]
      },
      {
        "h": "December 1896",
        "p": [
          "In December 1896 a pillar sticking out of a mound near the village of Rummindei was dug out by General Khadga Shumsher Rana, the local governor, with the German archaeologist Alois Führer. Below the ground line was Ashoka's inscription, as clear as the day it was cut. Lumbini had been found."
        ]
      },
      {
        "h": "The scandal",
        "p": [
          "Führer took most of the credit. Two years later he was exposed as a forger who had faked inscriptions and sold false relics, and in 1898 he resigned in disgrace. Historians still argue about how much of the find was really his. The pillar itself is not in doubt: scholars accept the inscription as genuine, and it stands today beside the Maya Devi Temple."
        ]
      }
    ],
    "sources": [
      {
        "label": "Lumbini pillar inscription",
        "url": "https://en.wikipedia.org/wiki/Lumbini_pillar_inscription"
      },
      {
        "label": "Alois Anton Führer",
        "url": "https://en.wikipedia.org/wiki/Alois_Anton_F%C3%BChrer"
      }
    ]
  },
  "kathmandu": {
    "parts": [
      {
        "h": "A closed kingdom",
        "p": [
          "For 104 years Nepal was run by the Rana family, hereditary prime ministers who kept the king as a figurehead and the country shut. Hardly any foreigners were let in, which is why the British Everest expeditions of the 1920s and 30s all went from Tibet."
        ]
      },
      {
        "h": "Six days in November",
        "p": [
          "On 6 November 1950 King Tribhuvan left the palace with most of his family, apparently for a hunting trip, and drove into the Indian embassy. Four days later Indian planes flew them to Delhi. The Ranas crowned his three-year-old grandson, Gyanendra, who had been left behind.",
          "It did not hold. After an armed uprising and talks in Delhi, Tribhuvan flew home in February 1951 and Rana rule was over. Nepal still marks the day as Democracy Day."
        ]
      },
      {
        "h": "Open for the mountains",
        "p": [
          "The opening came just as the race for the 8,000 m peaks began. The French were let in to try Annapurna in 1950, months before the revolution, and within a few years expeditions were pouring through Kathmandu. Everest was climbed from the Nepal side in 1953."
        ]
      }
    ],
    "sources": [
      {
        "label": "Tribhuvan of Nepal",
        "url": "https://en.wikipedia.org/wiki/Tribhuvan_of_Nepal"
      },
      {
        "label": "1950–1951 Nepalese revolution",
        "url": "https://en.wikipedia.org/wiki/1950%E2%80%931951_Nepalese_revolution"
      }
    ]
  },
  "pokhara": {
    "parts": [
      {
        "h": "An enemy worth hiring",
        "p": [
          "In 1814 the British East India Company went to war with the Gorkha kingdom. The fighting in the hills went badly for the British, and they were so impressed by the soldiers holding them off that they began recruiting them in 1815, before the war was even over. Gurkhas have served in the British Army for over two hundred years since, and when India became independent in 1947 the regiments were split, four going to Britain and six to India."
        ]
      },
      {
        "h": "Selection",
        "p": [
          "Today the British Gurkha camp in Pokhara runs the final selection. Thousands of young men, many from Gurung and Magar villages like the ones on your trek, compete for a few hundred places.",
          "The test everyone talks about is the doko race: about 5 km up a steep hill carrying 25 kg of sand in a doko, the cone-shaped basket you will see porters using on the trail. The cut-off has tightened over the years, from about 46 minutes in older accounts to 43 minutes in recent ones. Watch the porters on the ABC trail and you will see where the strength comes from."
        ]
      }
    ],
    "sources": [
      {
        "label": "Brigade of Gurkhas: selection in Pokhara",
        "url": "https://www.gurkhabde.com/news/gurkha-selection-in-full-swing-in-pokhara/"
      },
      {
        "label": "Gurkha",
        "url": "https://en.wikipedia.org/wiki/Gurkha"
      }
    ]
  },
  "ghandruk": {
    "parts": [
      {
        "h": "Gurung, or Tamu",
        "p": [
          "Most families here are Gurung, a people of the hills of central Nepal who call themselves Tamu. Their language, Tamu Kyi, is Tibeto-Burman, a cousin of Tibetan rather than of Nepali, though almost everyone speaks both. Many follow Buddhism, and some villages still keep older rituals led by their own priests, the Pachyu and Ghyabri.",
          "Since the British began recruiting in the hills after 1816, Gurung men have served as Gurkhas in great numbers."
        ]
      },
      {
        "h": "New year in midwinter",
        "p": [
          "The Gurung new year, Tamu Lhosar, falls on the 15th of the Nepali month of Poush, around 30 December. Villages like this one fill with dancing and traditional dress. It is now a public holiday across Nepal."
        ]
      },
      {
        "h": "Where ACAP began",
        "p": [
          "In 1986 a Nepali conservation trust started a pilot project in Ghandruk alone, about 200 sq km. The idea was new for Nepal: instead of moving people out to make a national park, local people would help run the land, with money from trekking going back into conservation and the villages.",
          "By 1990 it covered 16 village areas, and in 1992 it became the Annapurna Conservation Area, Nepal's largest protected area at 7,629 sq km. The permit you carry pays for it."
        ]
      }
    ],
    "sources": [
      {
        "label": "Gurung people",
        "url": "https://en.wikipedia.org/wiki/Gurung_people"
      },
      {
        "label": "Tamu Lhosar",
        "url": "https://en.wikipedia.org/wiki/Tamu_Lhosar"
      },
      {
        "label": "DNPWC: Annapurna Conservation Area",
        "url": "https://dnpwc.gov.np/en/conservation-area-detail/68"
      }
    ]
  },
  "chhomrong": {
    "parts": [
      {
        "h": "Into the Sanctuary",
        "p": [
          "Beyond Chhomrong the Modi Khola squeezes through a deep gorge before opening into the Sanctuary, a basin the Gurungs of these villages hold sacred. In spring 1956 Jimmy Roberts, a Gurkha officer who had served in Nepal for years, spent his leave forcing a way through it, and became one of the first outsiders to see the amphitheatre you are walking to."
        ]
      },
      {
        "h": "Mountain Travel",
        "p": [
          "Roberts had climbed and explored all over Nepal, and he thought its mountains should be open to more than expedition climbers. In 1964 he registered Mountain Travel, Nepal's first trekking company, and took his first paying clients out the next year: walkers with Sherpa guides and porters, camping along the old village trails.",
          "For four years it was the only trekking agency in the country. By the time Roberts died in 1997 there were hundreds, and teahouse trails like this one had become part of the life of these valleys. He is still called the father of trekking in Nepal."
        ]
      }
    ],
    "sources": [
      {
        "label": "J. O. M. Roberts",
        "url": "https://en.wikipedia.org/wiki/J._O._M._Roberts"
      },
      {
        "label": "Himalayan Journal: How it all began",
        "url": "https://himalayanclub.org/hj/64/12/how-it-all-began"
      }
    ]
  },
  "bamboo": {
    "parts": [
      {
        "h": "The bees",
        "p": [
          "The Himalayan giant honey bee, Apis laboriosa, is the largest honey bee in the world, up to 3 cm long. It builds huge single combs hanging under overhangs on cliff faces, high in the hills of Nepal and its neighbours."
        ]
      },
      {
        "h": "The hunters",
        "p": [
          "Twice a year, in spring and autumn, Gurung men from villages in central Nepal gather the honey the old way. They light fires below the cliff so the smoke drives off the bees, then one man climbs a rope ladder with wooden rungs, often with a long pole and a basket, and cuts the comb away while the others hold the lines. The hunt is tied to village festivals and has been done for generations."
        ]
      },
      {
        "h": "Why it is mad",
        "p": [
          "In spring the bees feed on rhododendron flowers, Nepal's national flower. The nectar carries grayanotoxin, and so does the honey. A little can make you light-headed; more brings dizziness, a slow heart, and hallucinations. It has a long history: in 401 BCE Greek soldiers near the Black Sea ate local mad honey and collapsed. They came round the next day, and were on their feet only on the third or fourth.",
          "Demand from abroad has grown, while bee scientists in Nepal warn that the cliff colonies are shrinking fast. If the bees go, the rhododendrons they pollinate may follow. If someone offers you a spoonful on the trail, a very small one is plenty."
        ]
      }
    ],
    "sources": [
      {
        "label": "Apis laboriosa",
        "url": "https://en.wikipedia.org/wiki/Apis_laboriosa"
      },
      {
        "label": "Mad honey",
        "url": "https://en.wikipedia.org/wiki/Mad_honey"
      },
      {
        "label": "Dialogue Earth: Nepal's honey hunters",
        "url": "https://dialogue.earth/en/food/nepal-honey-hunters-cling-to-traditions-as-bee-numbers-fall/"
      }
    ]
  },
  "himalaya": {
    "parts": [
      {
        "h": "A home for gods",
        "p": [
          "For the Gurung villages below, the basin at the head of this gorge was sacred. Hindu, Buddhist and older local deities were believed to live there, and the Nagas, serpent gods, were said to have hidden gold and treasure in it.",
          "Machhapuchhre, standing guard at the entrance, was the home of Shiva. The plume of snow that streams off its summit on most days was said to be the smoke of his incense."
        ]
      },
      {
        "h": "Rules of the gate",
        "p": [
          "Until recent decades nobody was allowed to carry eggs or meat past the gorge, and women and Dalits, then called untouchables, were not allowed in at all. Something of it survives: many lodges above Chhomrong still serve no meat."
        ]
      },
      {
        "h": "The first outsiders",
        "p": [
          "The first outsiders came in 1956, when Jimmy Roberts scouted Machhapuchhre for a climb the next year. From Chhomrong it took his party three days up this gorge, most of the way, he wrote, by dismal bamboo slogging. The book of that expedition is where the basin was first called the Sanctuary.",
          "Only seven or so hours of direct sun reach its floor at the height of summer. Walk on and you will see why."
        ]
      }
    ],
    "sources": [
      {
        "label": "Annapurna Sanctuary",
        "url": "https://en.wikipedia.org/wiki/Annapurna_Sanctuary"
      },
      {
        "label": "Machapuchare",
        "url": "https://en.wikipedia.org/wiki/Machapuchare"
      }
    ]
  },
  "deurali": {
    "parts": [
      {
        "h": "What happened",
        "p": [
          "On 17 January 2020, after heavy snow, an avalanche came down on the trail between Deurali and Himalaya. Four South Korean teachers on a volunteer trip and three Nepali guides were swept away. Five other trekkers nearby were rescued.",
          "Helicopters and search teams went in at once, but the snow was metres deep and more kept sliding. The first guide was found in late February. All four teachers were recovered between late April and early May, as the spring sun melted the debris."
        ]
      },
      {
        "h": "What it means for you",
        "p": [
          "This stretch runs under steep gullies off Hiunchuli, and they funnel snow straight onto the path. After a heavy fall the trail is often closed until the snow settles. If they say wait, wait. Set off early, because snow that softens in the afternoon sun is what slides."
        ]
      }
    ],
    "sources": [
      {
        "label": "Kathmandu Post",
        "url": "https://kathmandupost.com/8/2020/04/27/rescuers-recover-bodies-of-two-south-korean-tourists-buried-in-an-avalanche-in-january"
      },
      {
        "label": "Korea Herald",
        "url": "https://www.koreaherald.com/article/2209130"
      }
    ]
  },
  "mbc": {
    "parts": [
      {
        "h": "A soldier's leave",
        "p": [
          "In spring 1956 a Gurkha officer, Jimmy Roberts, spent his leave pushing up the gorge of the Modi Khola with Lal Bahadur Gurung and Ang Nyima Sherpa. From the Sanctuary he could see one route, and only one, with a chance of reaching the top of Machhapuchhre: a 2,100 m climb from the river to a col at the foot of the north ridge."
        ]
      },
      {
        "h": "A promise to the king",
        "p": [
          "Roberts came back in 1957 with Wilfrid Noyce, David Cox, Charles Wylie and Roger Chorley. Nepal allowed the attempt on one condition from King Mahendra: nobody would set foot on the summit, which is held sacred to Shiva. Chorley caught polio during the expedition and had to leave it.",
          "Noyce and Cox climbed the north ridge to about 150 ft (46 m) below the top. In bad snow and ice they turned back there, and the summit stayed untouched."
        ]
      },
      {
        "h": "Closed for good",
        "p": [
          "Roberts later asked the government to keep the mountain closed, and no climbing permit has been issued for it since. That makes Machhapuchhre, rising above your lodge, one of the very few great Himalayan peaks with no recorded ascent."
        ]
      },
      {
        "h": "A rumour",
        "p": [
          "\"No recorded ascent\" is doing some work there. Climbers have long said that Bill Denz, a bold New Zealand alpinist, slipped up the mountain illegally some time around the late 1970s or early 1980s. He never claimed it in public, the date changes with every telling, and he died in an avalanche on Makalu in 1983, so nobody can ask him. Officially, the summit has never been touched."
        ]
      }
    ],
    "sources": [
      {
        "label": "Machapuchare",
        "url": "https://en.wikipedia.org/wiki/Machapuchare"
      },
      {
        "label": "Himalayan Journal: Machhapuchhare",
        "url": "https://www.himalayanclub.org/hj/20/5/machhapuchhare/"
      },
      {
        "label": "Explorersweb: mountains climbed once, or not at all",
        "url": "https://explorersweb.com/mountains-climbed-just-once-or-not-at-all/"
      }
    ]
  },
  "abc": {
    "parts": [
      {
        "h": "Nobody had been that high",
        "p": [
          "By 1950 none of the world's fourteen peaks over 8,000 m had been climbed. Nepal had only just begun letting foreigners in, and France sent a team to try. They flew out of Paris on 30 March, led by Maurice Herzog, a 31-year-old amateur chosen by the French Alpine Club.",
          "With him were three of the best professional guides of the day, Louis Lachenal, Lionel Terray and Gaston Rébuffat, along with Jean Couzy, Marcel Schatz, the doctor Jacques Oudot and the filmmaker Marcel Ichac. Ang Tharkay led the Sherpa team."
        ]
      },
      {
        "h": "The wrong maps",
        "p": [
          "Their maps turned out to be badly wrong. The team spent most of April and early May on Dhaulagiri, which they judged impossible, and then weeks more just trying to find Annapurna, hidden behind other ridges. By the time they reached its foot it was late May. The monsoon was due in early June and would end all climbing, so they had about two weeks."
        ]
      },
      {
        "h": "3 June 1950",
        "p": [
          "They pushed a chain of five camps up the north face at speed. On 2 June Herzog and Lachenal reached the top camp at about 7,400 m. Herzog offered Ang Tharkay a place on the summit attempt; he declined and went down.",
          "The next morning was bitterly cold, and they had no bottled oxygen. Lachenal could feel his feet freezing in his light boots. He asked Herzog what he would do if he turned back. Herzog said he would go on alone, so Lachenal went with him. At about 2 pm they stood on the summit, higher than anyone had ever climbed. Herzog took photos holding the French flag on his ice axe."
        ]
      },
      {
        "h": "Coming down",
        "p": [
          "Near the top Herzog took off his gloves to open his pack, and they slid away down the slope. He went down barehanded, and his hands froze. Lachenal hurried ahead and fell. Terray and Rébuffat, waiting at the top camp, got both men in and spent the night rubbing their frozen limbs.",
          "The next day a storm hit. In the whiteout the four could not find the camp below, and Terray and Rébuffat went snow-blind after taking off their goggles to search. They spent the night in a crevasse, were buried by a small avalanche at dawn, and dug themselves out. Schatz heard their shouts and found them. Lower down another avalanche swept away Herzog and the Sherpas; they survived."
        ]
      },
      {
        "h": "The long carry out",
        "p": [
          "Then the monsoon arrived. The injured men were carried out on porters' backs for weeks, through floods and leeches. Along the way the doctor, Jacques Oudot, amputated fingers and toes as the tissue died, some of it on a train in India. Herzog lost almost all his fingers and toes, Lachenal his toes, and with them his career as a guide."
        ]
      },
      {
        "h": "Two versions of the climb",
        "p": [
          "Herzog came home a national hero. He dictated his book from a hospital bed, and it became one of the best-selling mountaineering books ever. It ends with a famous line: \"There are other Annapurnas in the lives of men.\" He later served as France's secretary of state for youth and sport.",
          "Every member had signed a contract not to publish his own account for five years. Lachenal died in 1955, when he fell into a hidden crevasse skiing the Vallée Blanche above Chamonix. His diaries came out in 1956, edited by Herzog's brother Gérard, with passages cut. When the uncut text was published in 1996, it told a different story: Lachenal had gone on mainly to look after Herzog, and the guides who saved the expedition got far less credit than they deserved. Herzog's triumph of will is the version millions read; Lachenal's is a desperate climb that only just avoided disaster."
        ]
      },
      {
        "h": "The face above you",
        "p": [
          "The French climbed the north side, out of sight from here. The wall you are looking at is the south face, and in 1970 it was one of the hardest climbs ever tried in the Himalaya. Chris Bonington's British team fixed ropes up its rock and ice for two months, and on 27 May Dougal Haston and Don Whillans reached the top. Days later, as the team packed up, Ian Clough was killed by falling ice below Camp 2. A plaque at base camp remembers him."
        ]
      }
    ],
    "sources": [
      {
        "label": "1950 French Annapurna expedition",
        "url": "https://en.wikipedia.org/wiki/1950_French_Annapurna_expedition"
      },
      {
        "label": "Louis Lachenal",
        "url": "https://en.wikipedia.org/wiki/Louis_Lachenal"
      },
      {
        "label": "Encyclopædia Universalis: Maurice Herzog",
        "url": "https://www.universalis.fr/encyclopedie/maurice-herzog/"
      },
      {
        "label": "1970 Annapurna South Face expedition",
        "url": "https://en.wikipedia.org/wiki/1970_British_Annapurna_South_Face_expedition"
      }
    ]
  },
  "ghorepani": {
    "parts": [
      {
        "h": "Horse water",
        "p": [
          "Ghorepani grew as a rest stop where traders watered their horses on the trail between the Kali Gandaki valley and Pokhara. Roads have since made the old route pointless, and trekkers have taken the traders' place: most lodges here exist for the pre-dawn walk up the hill."
        ]
      },
      {
        "h": "Whose hill",
        "p": [
          "Poon Hill is really Pun Hill. The Pun are a clan of the Magars, one of Nepal's largest peoples, whose old homeland lies west of the Gandaki. In Myagdi district, where you are now, more than a third of the population is Magar, and the Pun are the biggest group among them.",
          "Local accounts credit a retired Indian Army major, Tek Bahadur Pun, with giving the hill its name, after the families who farmed its slopes."
        ]
      },
      {
        "h": "Tul Bahadur Pun, VC",
        "p": [
          "Like the Gurungs, the Magars have sent generations of men into the Gurkhas. Tul Bahadur Pun was born in Banduk, a village in Myagdi. On 23 June 1944, at Mogaung in Burma, his section was cut down attacking a railway bridge: only he, his section commander and one other were left, and the commander was soon badly wounded. Alone, he charged the enemy position under heavy fire and took it, letting the rest of his platoon reach their objective. He was awarded the Victoria Cross, the highest British award for bravery, and died at home in Myagdi in 2011."
        ]
      }
    ],
    "sources": [
      {
        "label": "Poon Hill",
        "url": "https://en.wikipedia.org/wiki/Poon_Hill"
      },
      {
        "label": "Kathmandu Post: the Poon Hill and Ghandruk trek",
        "url": "https://kathmandupost.com/travel/2019/07/20/from-sunrise-to-local-heritage-the-poonhill-ghandruk-trek-makes-for-a-truly-enriching-experience"
      },
      {
        "label": "Magars",
        "url": "https://en.wikipedia.org/wiki/Magars"
      },
      {
        "label": "Tul Bahadur Pun",
        "url": "https://en.wikipedia.org/wiki/Tul_Bahadur_Pun_Magar"
      }
    ]
  },
  "abc-boukreev": {
    "parts": [
      {
        "h": "The storm on Everest",
        "p": [
          "In May 1996 Anatoli Boukreev, a climber from Kazakhstan known for climbing the highest peaks without bottled oxygen, was a guide on Scott Fischer's Mountain Madness expedition on Everest. On summit day a storm caught several teams high on the mountain, and eight people died, Fischer among them.",
          "That night, when others could not find them, Boukreev went out from the South Col alone, more than once, and brought three stranded clients back to the tents: Sandy Hill Pittman, Charlotte Fox and Tim Madsen. Every client on his team survived."
        ]
      },
      {
        "h": "Two versions, again",
        "p": [
          "Jon Krakauer's book Into Thin Air criticised him for climbing without oxygen and going down ahead of his clients. Boukreev answered with his own book, The Climb, written with G. Weston DeWalt. In 1997 the American Alpine Club gave him its highest honour, the David A. Sowles Memorial Award, for the rescue. Like Herzog and Lachenal, the climb lives on in two stories that do not agree."
        ]
      },
      {
        "h": "Christmas Day 1997",
        "p": [
          "That winter he came to Annapurna with the Italian climber Simone Moro and the cameraman Dimitri Sobolev, to try a winter route up the south-west ridge by the east face of Fang, the peak beside Annapurna you can see from here.",
          "On 25 December, as they fixed ropes, a cornice broke off the ridge high above and set off an avalanche. Moro was swept some 800 m down the slope and survived. Boukreev and Sobolev were never found."
        ]
      },
      {
        "h": "The stone",
        "p": [
          "In 1999 his partner, the American doctor and climber Linda Wylie, set up a memorial at base camp on a stone he had liked to sit on. It carries his best-known line: that mountains were not stadiums for his ambition, but the cathedrals where he practised his religion. It stands near the plaque to Ian Clough, under the mountain that killed them both."
        ]
      }
    ],
    "sources": [
      {
        "label": "Anatoli Boukreev",
        "url": "https://en.wikipedia.org/wiki/Anatoli_Boukreev"
      },
      {
        "label": "Explorersweb: remembering Anatoli Boukreev",
        "url": "https://explorersweb.com/remembering-anatoli-boukreev/"
      },
      {
        "label": "Himalayan Database: Annapurna I, 1997",
        "url": "https://himalayan-database.climbing-history.org/expedition/ANN197402/1997"
      }
    ]
  },
  "pokhara-airport": {
    "parts": [
      {
        "h": "A long wait",
        "p": [
          "In 1975 the government took over land on the east side of Pokhara for an airport big enough for jets. A Japanese feasibility study followed in 1989, and other studies after it, but for decades nothing was built while the city grew around the empty site."
        ]
      },
      {
        "h": "A Chinese loan",
        "p": [
          "In 2014 Nepal's civil aviation authority signed a contract with China CAMC Engineering for about US$216 million. In March 2016 Nepal borrowed the money from China's Exim Bank on soft terms, with the airport's own revenue pledged against the loan.",
          "How the contract came to cost what it did has since been the subject of corruption charges in Nepal, and of a long argument about Chinese influence."
        ]
      },
      {
        "h": "Open, and empty",
        "p": [
          "The airport opened on 1 January 2023. The first international flight came six months later, on 21 June: a Sichuan Airlines charter from Chengdu. Regular international services only began in 2025, with charters from Chengdu and a weekly Himalaya Airlines flight to Lhasa, while the loan falls due whether the planes come or not.",
          "If you fly in from Kathmandu, this is where you land: one of the most argued-over buildings in Nepal."
        ]
      }
    ],
    "sources": [
      {
        "label": "Pokhara International Airport",
        "url": "https://en.wikipedia.org/wiki/Pokhara_International_Airport"
      },
      {
        "label": "Kathmandu Post: Pokhara's four-decade-old dream",
        "url": "https://kathmandupost.com/money/2017/08/03/pokharas-4-decade-old-dream-within-grasp"
      },
      {
        "label": "Kathmandu Post: China's soft power, Nepal's hard landing",
        "url": "https://kathmandupost.com/money/2025/05/10/pokhara-airport-china-s-soft-power-nepal-s-hard-landing"
      }
    ]
  },
  "pokhara-seti": {
    "parts": [
      {
        "h": "Out of a clear sky",
        "p": [
          "Seti means white, after the glacier silt that colours the river running through its slot of a gorge under the city. On 5 May 2012, with no rain falling, it suddenly rose into a torrent of mud and boulders.",
          "The worst hit was Kharapani, upstream of Pokhara, a hot-spring spot busy with picnickers, pilgrims, sand quarry workers and a few foreign tourists. About 72 people were killed or never found."
        ]
      },
      {
        "h": "The pilot",
        "p": [
          "Alexander Maximov, flying an ultralight north of the city, saw the flood racing down the gorge. He turned back and radioed the airport tower, and local radio broadcast the warning. It is credited with saving lives downstream, but it did not reach Kharapani in time."
        ]
      },
      {
        "h": "What happened up there",
        "p": [
          "Scientists traced the flood to the Sabche Cirque, a vast bowl under Annapurna IV, where a huge mass of rock and ice broke away and fell. It turned into a flood of debris that poured down the Seti gorge. Whether the gorge had been dammed first, and burst, is still argued over.",
          "Either way it was a warning about living below these mountains, and research and warning systems on the Seti have grown since."
        ]
      }
    ],
    "sources": [
      {
        "label": "Nepali Times: anatomy of a Himalayan tsunami",
        "url": "https://nepalitimes.com/anatomy-of-a-himalayan-tsunami"
      },
      {
        "label": "AGU Landslide Blog: understanding the Seti River landslide",
        "url": "https://blogs.agu.org/landslideblog/2012/05/23/understanding-the-seti-river-landslide-in-nepal/"
      },
      {
        "label": "ReliefWeb: Seti River flooding",
        "url": "https://reliefweb.int/report/nepal/updates-flooding-seti-river-situation-report-03"
      }
    ]
  },
  "kathmandu-2015": {
    "parts": [
      {
        "h": "Saturday, 11:56",
        "p": [
          "On 25 April 2015 a magnitude 7.8 earthquake struck, centred in Gorkha district north-west of Kathmandu. Nearly 9,000 people died across Nepal, most of them in hill villages where houses of stone and mud collapsed. It set off an avalanche that killed 22 people at Everest Base Camp, and a second big quake on 12 May added to the damage."
        ]
      },
      {
        "h": "The city's landmarks",
        "p": [
          "In Kathmandu the Dharahara, a nine-storey watchtower built in the 1830s for the prime minister Bhimsen Thapa, fell, killing dozens of people who had climbed it on their day off. On Durbar Square, Kasthamandap, the old wooden rest house that is said to have given Kathmandu its name, collapsed, and many of the temples around it were destroyed or badly damaged."
        ]
      },
      {
        "h": "Rebuilding",
        "p": [
          "Rebuilding was slow, held up by politics and by a months-long blockade at the Indian border later that year. A new Dharahara rose beside the stump of the old one, which is kept as a memorial, and was inaugurated in April 2021. Kasthamandap has been rebuilt in timber and brick.",
          "On Durbar Square, look for bright new wood and brick among the old. Each patch marks something that fell."
        ]
      }
    ],
    "sources": [
      {
        "label": "April 2015 Nepal earthquake",
        "url": "https://en.wikipedia.org/wiki/April_2015_Nepal_earthquake"
      },
      {
        "label": "Dharahara",
        "url": "https://en.wikipedia.org/wiki/Dharahara"
      },
      {
        "label": "Kasthamandap",
        "url": "https://en.wikipedia.org/wiki/Kasthamandap"
      }
    ]
  }
};
