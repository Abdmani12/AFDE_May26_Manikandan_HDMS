"""
Seed script: 500 books by Indian authors, 100 members, 300 transactions.
Run from backend directory: python seed_indian_library.py
"""
import sys, os, random
from datetime import datetime, timedelta
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from database import SessionLocal, engine
import models
from sqlalchemy import text

random.seed(42)

# ── Books: (title, author) grouped by category ─────────────────────

FICTION = [
    # R.K. Narayan (16)
    ("Swami and Friends", "R.K. Narayan"),
    ("The Bachelor of Arts", "R.K. Narayan"),
    ("The Dark Room", "R.K. Narayan"),
    ("The English Teacher", "R.K. Narayan"),
    ("Mr Sampath The Printer of Malgudi", "R.K. Narayan"),
    ("The Financial Expert", "R.K. Narayan"),
    ("Waiting for the Mahatma", "R.K. Narayan"),
    ("The Guide", "R.K. Narayan"),
    ("The Man-Eater of Malgudi", "R.K. Narayan"),
    ("The Vendor of Sweets", "R.K. Narayan"),
    ("The Painter of Signs", "R.K. Narayan"),
    ("A Tiger for Malgudi", "R.K. Narayan"),
    ("Talkative Man", "R.K. Narayan"),
    ("The World of Nagaraj", "R.K. Narayan"),
    ("Grandmother's Tale", "R.K. Narayan"),
    ("Malgudi Days", "R.K. Narayan"),
    # Ruskin Bond (8)
    ("The Room on the Roof", "Ruskin Bond"),
    ("A Flight of Pigeons", "Ruskin Bond"),
    ("The Blue Umbrella", "Ruskin Bond"),
    ("Our Trees Still Grow in Dehra", "Ruskin Bond"),
    ("Vagrants in the Valley", "Ruskin Bond"),
    ("The Night Train at Deoli", "Ruskin Bond"),
    ("Time Stops at Shamli", "Ruskin Bond"),
    ("A Book of Simple Living", "Ruskin Bond"),
    # Arundhati Roy (2)
    ("The God of Small Things", "Arundhati Roy"),
    ("The Ministry of Utmost Happiness", "Arundhati Roy"),
    # Vikram Seth (4)
    ("A Suitable Boy", "Vikram Seth"),
    ("The Golden Gate", "Vikram Seth"),
    ("An Equal Music", "Vikram Seth"),
    ("Two Lives", "Vikram Seth"),
    # Amitav Ghosh (8)
    ("The Shadow Lines", "Amitav Ghosh"),
    ("The Glass Palace", "Amitav Ghosh"),
    ("Sea of Poppies", "Amitav Ghosh"),
    ("River of Smoke", "Amitav Ghosh"),
    ("Flood of Fire", "Amitav Ghosh"),
    ("The Hungry Tide", "Amitav Ghosh"),
    ("The Calcutta Chromosome", "Amitav Ghosh"),
    ("Gun Island", "Amitav Ghosh"),
    # Jhumpa Lahiri (4)
    ("The Namesake", "Jhumpa Lahiri"),
    ("Interpreter of Maladies", "Jhumpa Lahiri"),
    ("Unaccustomed Earth", "Jhumpa Lahiri"),
    ("The Lowland", "Jhumpa Lahiri"),
    # Kiran Desai (2)
    ("The Inheritance of Loss", "Kiran Desai"),
    ("Hullabaloo in the Guava Orchard", "Kiran Desai"),
    # Aravind Adiga (5)
    ("The White Tiger", "Aravind Adiga"),
    ("Between the Assassinations", "Aravind Adiga"),
    ("Last Man in Tower", "Aravind Adiga"),
    ("Selection Day", "Aravind Adiga"),
    ("Amnesty", "Aravind Adiga"),
    # Chetan Bhagat (7)
    ("Five Point Someone", "Chetan Bhagat"),
    ("One Night at the Call Center", "Chetan Bhagat"),
    ("The 3 Mistakes of My Life", "Chetan Bhagat"),
    ("2 States", "Chetan Bhagat"),
    ("Revolution 2020", "Chetan Bhagat"),
    ("Half Girlfriend", "Chetan Bhagat"),
    ("One Arranged Murder", "Chetan Bhagat"),
    # Anita Desai (6)
    ("Clear Light of Day", "Anita Desai"),
    ("Baumgartner's Bombay", "Anita Desai"),
    ("In Custody", "Anita Desai"),
    ("Fasting Feasting", "Anita Desai"),
    ("The Village by the Sea", "Anita Desai"),
    ("Fire on the Mountain", "Anita Desai"),
    # Manju Kapur (5)
    ("Difficult Daughters", "Manju Kapur"),
    ("A Married Woman", "Manju Kapur"),
    ("Home", "Manju Kapur"),
    ("The Immigrant", "Manju Kapur"),
    ("Custody", "Manju Kapur"),
    # Shashi Tharoor - Fiction (3)
    ("The Great Indian Novel", "Shashi Tharoor"),
    ("Show Business", "Shashi Tharoor"),
    ("Riot", "Shashi Tharoor"),
    # Salman Rushdie (5)
    ("Midnight's Children", "Salman Rushdie"),
    ("Shame", "Salman Rushdie"),
    ("The Moor's Last Sigh", "Salman Rushdie"),
    ("Haroun and the Sea of Stories", "Salman Rushdie"),
    ("The Satanic Verses", "Salman Rushdie"),
    # Rohinton Mistry (3)
    ("Such a Long Journey", "Rohinton Mistry"),
    ("A Fine Balance", "Rohinton Mistry"),
    ("Family Matters", "Rohinton Mistry"),
    # Vikram Chandra (3)
    ("Sacred Games", "Vikram Chandra"),
    ("Red Earth and Pouring Rain", "Vikram Chandra"),
    ("Love and Longing in Bombay", "Vikram Chandra"),
    # Perumal Murugan (4)
    ("One Part Woman", "Perumal Murugan"),
    ("Poonachi", "Perumal Murugan"),
    ("Seasons of the Palm", "Perumal Murugan"),
    ("Current Show", "Perumal Murugan"),
    # Sudha Murthy (8)
    ("Wise and Otherwise", "Sudha Murthy"),
    ("Dollar Bahu", "Sudha Murthy"),
    ("Mahashweta", "Sudha Murthy"),
    ("The Day I Stopped Drinking Milk", "Sudha Murthy"),
    ("House of Cards", "Sudha Murthy"),
    ("Three Thousand Stitches", "Sudha Murthy"),
    ("Gently Falls the Bakula", "Sudha Murthy"),
    ("Here There and Everywhere", "Sudha Murthy"),
    # Others
    ("Em and the Big Hoom", "Jerry Pinto"),
    ("English August", "Upamanyu Chatterjee"),
    ("The Mammaries of the Welfare State", "Upamanyu Chatterjee"),
    ("An Atlas of Impossible Longing", "Anuradha Roy"),
    ("The Folded Earth", "Anuradha Roy"),
    ("All the Lives We Never Lived", "Anuradha Roy"),
    ("Train to Pakistan", "Khushwant Singh"),
    ("Delhi A Novel", "Khushwant Singh"),
    ("Tamas", "Bhisham Sahni"),
    ("Pinjar", "Amrita Pritam"),
    ("Mistress of Spices", "Chitra Banerjee Divakaruni"),
    ("Sister of My Heart", "Chitra Banerjee Divakaruni"),
    ("One Amazing Thing", "Chitra Banerjee Divakaruni"),
    ("Godan", "Munshi Premchand"),
    ("Gaban", "Munshi Premchand"),
    ("Nirmala", "Munshi Premchand"),
    ("Paro Dreams of Passion", "Namita Gokhale"),
    ("Gods Graves and Grandmother", "Namita Gokhale"),
    ("The Alchemy of Desire", "Tarun Tejpal"),
    ("The Romantics", "Pankaj Mishra"),
    ("Ravan and Eddie", "Kiran Nagarkar"),
    ("The Extras", "Kiran Nagarkar"),
    ("The Space Between Us", "Thrity Umrigar"),
    ("Bombay Time", "Thrity Umrigar"),
    ("The Weight of Heaven", "Thrity Umrigar"),
    ("If Today Be Sweet", "Thrity Umrigar"),
    ("The Story Hour", "Thrity Umrigar"),
]  # 120 total

HISTORY = [
    # Ramachandra Guha (7)
    ("India After Gandhi", "Ramachandra Guha"),
    ("Gandhi Before India", "Ramachandra Guha"),
    ("Gandhi The Years That Changed the World", "Ramachandra Guha"),
    ("Environmentalism A Global History", "Ramachandra Guha"),
    ("Makers of Modern India", "Ramachandra Guha"),
    ("A Corner of a Foreign Field", "Ramachandra Guha"),
    ("The Last Liberal and Other Essays", "Ramachandra Guha"),
    # William Dalrymple (8)
    ("The Last Mughal", "William Dalrymple"),
    ("White Mughals", "William Dalrymple"),
    ("Return of a King", "William Dalrymple"),
    ("City of Djinns", "William Dalrymple"),
    ("Nine Lives", "William Dalrymple"),
    ("The Anarchy", "William Dalrymple"),
    ("From the Holy Mountain", "William Dalrymple"),
    ("In Xanadu", "William Dalrymple"),
    # Shashi Tharoor - History (7)
    ("An Era of Darkness", "Shashi Tharoor"),
    ("Inglorious Empire", "Shashi Tharoor"),
    ("The Paradoxical Prime Minister", "Shashi Tharoor"),
    ("Nehru The Invention of India", "Shashi Tharoor"),
    ("India From Midnight to the Millennium", "Shashi Tharoor"),
    ("Why I Am a Hindu", "Shashi Tharoor"),
    ("The Battle of Belonging", "Shashi Tharoor"),
    # Romila Thapar (5)
    ("The Penguin History of Early India", "Romila Thapar"),
    ("A History of India Volume 1", "Romila Thapar"),
    ("Ashoka and the Decline of the Mauryas", "Romila Thapar"),
    ("Somanatha The Many Voices of a History", "Romila Thapar"),
    ("The Past Before Us", "Romila Thapar"),
    # Jawaharlal Nehru (3)
    ("The Discovery of India", "Jawaharlal Nehru"),
    ("Glimpses of World History", "Jawaharlal Nehru"),
    ("An Autobiography", "Jawaharlal Nehru"),
    # Bipan Chandra (3)
    ("India's Struggle for Independence", "Bipan Chandra"),
    ("History of Modern India", "Bipan Chandra"),
    ("The Rise and Growth of Economic Nationalism in India", "Bipan Chandra"),
    # Various historians
    ("The Idea of India", "Sunil Khilnani"),
    ("India A Portrait", "Patrick French"),
    ("Liberty or Death", "Patrick French"),
    ("A History of the Sikhs Volume 1", "Khushwant Singh"),
    ("A History of the Sikhs Volume 2", "Khushwant Singh"),
    ("Annihilation of Caste", "B.R. Ambedkar"),
    ("Who Were the Shudras", "B.R. Ambedkar"),
    ("The Buddha and His Dhamma", "B.R. Ambedkar"),
    ("Waiting for a Visa", "B.R. Ambedkar"),
    ("India Unbound", "Gurcharan Das"),
    ("The Elephant Paradigm", "Gurcharan Das"),
    ("Jawaharlal Nehru A Biography Volume 1", "Sarvepalli Gopal"),
    ("Jawaharlal Nehru A Biography Volume 2", "Sarvepalli Gopal"),
    ("India's Wars A Military History", "Arjun Subramaniam"),
    ("The Agrarian System of Mughal India", "Irfan Habib"),
    ("Medieval India The Study of a Civilization", "Irfan Habib"),
    ("Medieval India Part 1", "Satish Chandra"),
    ("Medieval India Part 2", "Satish Chandra"),
    ("Ancient India", "R.C. Majumdar"),
    ("History of Medieval Bengal", "R.C. Majumdar"),
    ("India Partitioned The Other Face of Freedom", "Mushirul Hasan"),
    ("A Nationalist Conscience", "Mushirul Hasan"),
    ("Bengal Divided", "Joya Chatterji"),
    ("The Spoils of Partition", "Joya Chatterji"),
    ("Modernity at Large", "Arjun Appadurai"),
    ("The Mughal World", "Abraham Eraly"),
    ("Emperors of the Peacock Throne", "Abraham Eraly"),
    ("The Last Spring", "Abraham Eraly"),
    ("Gem in the Lotus", "Abraham Eraly"),
    ("Indira India's Most Powerful Prime Minister", "Sagarika Ghose"),
    ("The Accidental Prime Minister", "Sanjay Baru"),
    ("1991 How PV Narasimha Rao Made History", "Sanjay Baru"),
    ("The Great Partition", "Yasmin Khan"),
    ("The Other Side of Silence", "Urvashi Butalia"),
    ("The Wonder That Was India", "A.L. Basham"),
    ("India A History", "John Keay"),
    ("A New History of India", "Stanley Wolpert"),
    ("Plassey The Battle That Changed Indian History", "Sudeep Chakravarti"),
    ("A History of India Volume 2", "Percival Spear"),
    ("A History of South India", "K.A. Nilakanta Sastri"),
    ("Raj The Making of British India", "Lawrence James"),
    ("The History of India", "Vinay Lal"),
    ("Hindu Rulers Muslim Subjects", "Mridu Rai"),
    ("Before Memory Fades", "Fali S. Nariman"),
    ("My Presidential Years", "R. Venkataraman"),
    ("By Many a Happy Accident", "Hamid Ansari"),
]  # 80 total

NONFICTION = [
    # A.P.J. Abdul Kalam (7)
    ("Wings of Fire", "A.P.J. Abdul Kalam"),
    ("Ignited Minds", "A.P.J. Abdul Kalam"),
    ("India 2020", "A.P.J. Abdul Kalam"),
    ("The Luminous Sparks", "A.P.J. Abdul Kalam"),
    ("Transcendence My Spiritual Experiences", "A.P.J. Abdul Kalam"),
    ("Turning Points", "A.P.J. Abdul Kalam"),
    ("My Journey Transforming Dreams into Actions", "A.P.J. Abdul Kalam"),
    # Amartya Sen (5)
    ("The Argumentative Indian", "Amartya Sen"),
    ("Development as Freedom", "Amartya Sen"),
    ("The Idea of Justice", "Amartya Sen"),
    ("Identity and Violence", "Amartya Sen"),
    ("An Uncertain Glory", "Amartya Sen"),
    # Raghuram Rajan (4)
    ("Fault Lines", "Raghuram Rajan"),
    ("I Do What I Do", "Raghuram Rajan"),
    ("The Third Pillar", "Raghuram Rajan"),
    ("Saving Capitalism from the Capitalists", "Raghuram Rajan"),
    # Nandan Nilekani (2)
    ("Imagining India", "Nandan Nilekani"),
    ("Rebooting India", "Nandan Nilekani"),
    # C.K. Prahalad (3)
    ("The Fortune at the Bottom of the Pyramid", "C.K. Prahalad"),
    ("Competing for the Future", "C.K. Prahalad"),
    ("The New Age of Innovation", "C.K. Prahalad"),
    # Mahatma Gandhi (4)
    ("The Story of My Experiments with Truth", "Mahatma Gandhi"),
    ("Hind Swaraj", "Mahatma Gandhi"),
    ("My Nonviolence", "Mahatma Gandhi"),
    ("My Philosophy of Life", "Mahatma Gandhi"),
    # Swami Vivekananda (4)
    ("Raja Yoga", "Swami Vivekananda"),
    ("Karma Yoga", "Swami Vivekananda"),
    ("Jnana Yoga", "Swami Vivekananda"),
    ("The Complete Works of Swami Vivekananda Volume 1", "Swami Vivekananda"),
    # Others
    ("Autobiography of a Yogi", "Paramahansa Yogananda"),
    ("The Laws of Medicine", "Siddhartha Mukherjee"),
    ("The Song of the Cell", "Siddhartha Mukherjee"),
    ("From the Ruins of Empire", "Pankaj Mishra"),
    ("Age of Anger", "Pankaj Mishra"),
    ("The Difficulty of Being Good", "Gurcharan Das"),
    ("A Better India A Better World", "N.R. Narayana Murthy"),
    ("The Art of the Innovator", "N.R. Narayana Murthy"),
    ("Playing It My Way", "Sachin Tendulkar"),
    ("Mind Master", "Viswanathan Anand"),
    ("The Wipro Story", "Azim Premji"),
    ("The Biocon Story", "Kiran Mazumdar-Shaw"),
    ("Reverse Innovation", "Vijay Govindarajan"),
    ("Three Box Solution", "Vijay Govindarajan"),
    ("Being Mortal", "Atul Gawande"),
    ("Complications", "Atul Gawande"),
    ("The Checklist Manifesto", "Atul Gawande"),
    ("Better", "Atul Gawande"),
    ("Billions of Entrepreneurs", "Tarun Khanna"),
    ("Winning in Emerging Markets", "Tarun Khanna"),
    ("Jugaad Innovation", "Navi Radjou"),
    ("Frugal Innovation", "Navi Radjou"),
    ("The Insider", "P.V. Narasimha Rao"),
    ("Changing India", "Manmohan Singh"),
    ("Worshipping False Gods", "Arun Shourie"),
    ("Courts and Their Judgments", "Arun Shourie"),
    ("India's Broken Tryst", "Tavleen Singh"),
    ("India Reborn", "Shekhar Gupta"),
    ("Strategic Consequences of India's Economic Performance", "Sanjaya Baru"),
    ("Stranger to History", "Aatish Taseer"),
    ("Being Indian", "Pavan K. Varma"),
    ("Becoming Indian", "Pavan K. Varma"),
    ("Beyond the Lines An Autobiography", "Kuldip Nayar"),
    ("The Lucknow Boy A Memoir", "Vinod Mehta"),
    ("Truth Love and a Little Malice", "Khushwant Singh"),
    ("Absolute Khushwant", "Khushwant Singh"),
    ("Kasturba", "Sushila Nayar"),
    ("Saga of Indian Sculpture", "K.M. Munshi"),
    ("The Hindu View of Life", "S. Radhakrishnan"),
    ("Introduction to the Study of Indian History", "D.D. Kosambi"),
    ("Science and Sustainable Food Security", "M.S. Swaminathan"),
]  # 70 total

FANTASY = [
    # Amish Tripathi (9)
    ("The Immortals of Meluha", "Amish Tripathi"),
    ("The Secret of the Nagas", "Amish Tripathi"),
    ("The Oath of the Vayuputras", "Amish Tripathi"),
    ("Scion of Ikshvaku", "Amish Tripathi"),
    ("Sita Warrior of Mithila", "Amish Tripathi"),
    ("Raavan Enemy of Aryavarta", "Amish Tripathi"),
    ("War of Lanka", "Amish Tripathi"),
    ("Legend of Suheldev", "Amish Tripathi"),
    ("The Forest of Purity", "Amish Tripathi"),
    # Devdutt Pattanaik (9)
    ("Myth Equals Mithya", "Devdutt Pattanaik"),
    ("Jaya An Illustrated Retelling of the Mahabharata", "Devdutt Pattanaik"),
    ("Sita An Illustrated Retelling of the Ramayana", "Devdutt Pattanaik"),
    ("The Book of Ram", "Devdutt Pattanaik"),
    ("Shikhandi and Other Tales", "Devdutt Pattanaik"),
    ("7 Secrets of the Goddess", "Devdutt Pattanaik"),
    ("7 Secrets of Vishnu", "Devdutt Pattanaik"),
    ("The Pregnant King", "Devdutt Pattanaik"),
    ("Olympus An Indian Retelling", "Devdutt Pattanaik"),
    # Anand Neelakantan (5)
    ("Ajaya Roll of the Dice", "Anand Neelakantan"),
    ("Ajaya Rise of Kali", "Anand Neelakantan"),
    ("Asura Tale of the Vanquished", "Anand Neelakantan"),
    ("Vanara The Legend of Baali", "Anand Neelakantan"),
    ("Mavericks of Mahabharata", "Anand Neelakantan"),
    # Kevin Missal (4)
    ("Kalki", "Kevin Missal"),
    ("Pralay The Great Deluge", "Kevin Missal"),
    ("Renegade", "Kevin Missal"),
    ("Dhruv Reborn", "Kevin Missal"),
    # Roshani Chokshi (5)
    ("The Star-Touched Queen", "Roshani Chokshi"),
    ("A Crown of Wishes", "Roshani Chokshi"),
    ("The Gilded Wolves", "Roshani Chokshi"),
    ("The Silvered Serpents", "Roshani Chokshi"),
    ("The Bronzed Beasts", "Roshani Chokshi"),
    # Chitra Banerjee Divakaruni (4)
    ("The Palace of Illusions", "Chitra Banerjee Divakaruni"),
    ("The Forest of Enchantments", "Chitra Banerjee Divakaruni"),
    ("The Brotherhood of the Conch", "Chitra Banerjee Divakaruni"),
    ("In the Land of the Goddess", "Chitra Banerjee Divakaruni"),
    # Ashwin Sanghi (6)
    ("The Rozabal Line", "Ashwin Sanghi"),
    ("Chanakya's Chant", "Ashwin Sanghi"),
    ("The Krishna Key", "Ashwin Sanghi"),
    ("The Sialkot Saga", "Ashwin Sanghi"),
    ("Keepers of the Kalachakra", "Ashwin Sanghi"),
    ("The Vault of Vishnu", "Ashwin Sanghi"),
    # Kavita Kane (4)
    ("Karna's Wife The Outcast's Queen", "Kavita Kane"),
    ("Sita's Sister", "Kavita Kane"),
    ("Lanka's Princess", "Kavita Kane"),
    ("Menaka's Choice", "Kavita Kane"),
    # Anuja Chandramouli (4)
    ("Arjuna Saga of a Pandava Warrior-Prince", "Anuja Chandramouli"),
    ("Shakuntala The Woman Wronged", "Anuja Chandramouli"),
    ("Priya In Shadow and Light", "Anuja Chandramouli"),
    ("Dharmaputra", "Anuja Chandramouli"),
    # Krishna Udayasankar (3)
    ("The Aryavarta Chronicles Govinda", "Krishna Udayasankar"),
    ("The Aryavarta Chronicles Kaurava", "Krishna Udayasankar"),
    ("The Aryavarta Chronicles Kurukshetra", "Krishna Udayasankar"),
    # Others (7)
    ("The Far Field of God", "Kota Neelima"),
    ("The God Who Loved Only Himself", "Kota Neelima"),
    ("Turbulence", "Samit Basu"),
    ("Resistance", "Samit Basu"),
    ("Age of Kali", "Rakshas Singh"),
    ("The Shadow Throne", "Aroon Raman"),
    ("No Guns at My Son's Funeral", "Paro Anand"),
]  # 60 total

MYSTERY = [
    # Tarquin Hall - Vish Puri (5)
    ("The Case of the Missing Servant", "Tarquin Hall"),
    ("The Case of the Man Who Died Laughing", "Tarquin Hall"),
    ("The Case of the Deadly Butter Chicken", "Tarquin Hall"),
    ("The Case of the Love Commandos", "Tarquin Hall"),
    ("The Delhi Detective's Manual", "Tarquin Hall"),
    # Vikas Swarup (3)
    ("Q and A", "Vikas Swarup"),
    ("Six Suspects", "Vikas Swarup"),
    ("The Accidental Apprentice", "Vikas Swarup"),
    # S. Hussain Zaidi (6)
    ("Mafia Queens of Mumbai", "S. Hussain Zaidi"),
    ("Dongri to Dubai", "S. Hussain Zaidi"),
    ("Black Friday", "S. Hussain Zaidi"),
    ("Byculla to Bangkok", "S. Hussain Zaidi"),
    ("Headley and I", "S. Hussain Zaidi"),
    ("Mumbai Avengers", "S. Hussain Zaidi"),
    # Ravi Subramanian (8)
    ("If God Was a Banker", "Ravi Subramanian"),
    ("Devil in Pinstripes", "Ravi Subramanian"),
    ("The Incredible Banker", "Ravi Subramanian"),
    ("The Bankster", "Ravi Subramanian"),
    ("Bankerupt", "Ravi Subramanian"),
    ("God is a Gamer", "Ravi Subramanian"),
    ("In the Name of God", "Ravi Subramanian"),
    ("The Bad Bank", "Ravi Subramanian"),
    # Satyajit Ray - Feluda (5)
    ("The Emperor's Ring", "Satyajit Ray"),
    ("The Criminals of Kathmandu", "Satyajit Ray"),
    ("The Royal Bengal Tiger", "Satyajit Ray"),
    ("The Bose File", "Satyajit Ray"),
    ("The Adventure of Tota Kahini", "Satyajit Ray"),
    # Sharadindu Bandyopadhyay - Byomkesh (5)
    ("The Menagerie", "Sharadindu Bandyopadhyay"),
    ("The Gramophone Pin", "Sharadindu Bandyopadhyay"),
    ("The Detective Agency", "Sharadindu Bandyopadhyay"),
    ("The Scorpion's Sting", "Sharadindu Bandyopadhyay"),
    ("The Ace of Spades", "Sharadindu Bandyopadhyay"),
    # Harini Nagendra (3)
    ("The Bangalore Detectives Club", "Harini Nagendra"),
    ("A Nest of Vipers", "Harini Nagendra"),
    ("A Strand of Truth", "Harini Nagendra"),
    # Vaseem Khan (4)
    ("Midnight at Malabar House", "Vaseem Khan"),
    ("Shadows of the Past", "Vaseem Khan"),
    ("The Strange Disappearance of a Bollywood Star", "Vaseem Khan"),
    ("An Inspector Chopra Investigates", "Vaseem Khan"),
    # Mukul Deva (4)
    ("The Killing of a Maharaja", "Mukul Deva"),
    ("Mission Impossible Mumbai", "Mukul Deva"),
    ("Lashkar", "Mukul Deva"),
    ("Blowback", "Mukul Deva"),
    # Others (7)
    ("The Saffron Murders", "Piyush Jha"),
    ("Compass Box Killer", "Piyush Jha"),
    ("The Devil's Breath", "Anirban Bose"),
    ("The Patna Conspiracy", "S. Priya"),
    ("Sacred Evil", "Vikrant Khanna"),
    ("Kolkata Noir", "Nilabhra Sen"),
    ("Private India", "Ashwin Sanghi"),
]  # 50 total

SCIENCE = [
    # Jayant Narlikar (8)
    ("Introduction to Cosmology", "Jayant Narlikar"),
    ("The Lighter Side of Gravity", "Jayant Narlikar"),
    ("Seven Wonders of the Cosmos", "Jayant Narlikar"),
    ("Scientific Edge", "Jayant Narlikar"),
    ("From Black Clouds to Black Holes", "Jayant Narlikar"),
    ("A Different Approach to Cosmology", "Jayant Narlikar"),
    ("The Return of Vaman", "Jayant Narlikar"),
    ("Violent Phenomena in the Universe", "Jayant Narlikar"),
    # V.S. Ramachandran (4)
    ("Phantoms in the Brain", "V.S. Ramachandran"),
    ("The Tell-Tale Brain", "V.S. Ramachandran"),
    ("A Brief Tour of Human Consciousness", "V.S. Ramachandran"),
    ("The Emerging Mind", "V.S. Ramachandran"),
    # C.V. Raman (2)
    ("Scientific Papers of C.V. Raman", "C.V. Raman"),
    ("The Raman Effect A Unified Treatment", "C.V. Raman"),
    # Siddhartha Mukherjee (2)
    ("The Emperor of All Maladies", "Siddhartha Mukherjee"),
    ("The Gene An Intimate History", "Siddhartha Mukherjee"),
    # Subrahmanyan Chandrasekhar (2)
    ("The Mathematical Theory of Black Holes", "Subrahmanyan Chandrasekhar"),
    ("Eddington The Most Distinguished Astrophysicist", "Subrahmanyan Chandrasekhar"),
    # Others
    ("Mathematics in India", "P.C. Vaidya"),
    ("Response in the Living and Non-Living", "J.C. Bose"),
    ("Collected Papers of Srinivasa Ramanujan", "S. Ramanujan"),
    ("Statistics and Society", "P.C. Mahalanobis"),
    ("Nuclear Science in India", "Homi J. Bhabha"),
    ("The Saha Ionization Equation", "Meghnad Saha"),
    ("The Crest of the Peacock", "George Gheverghese Joseph"),
    ("Indian Mathematics Engaging with the World", "George Gheverghese Joseph"),
    ("Music Language and the Brain", "Aniruddh Patel"),
    ("Gene Machine", "Venkatraman Ramakrishnan"),
    ("Science and Society", "M.G.K. Menon"),
    ("Nanomaterials and Nanotechnology", "C.N.R. Rao"),
    ("Quantum Mechanics for Scientists", "E.C.G. Sudarshan"),
    ("Algebraic Geometry for Engineers", "S.S. Abhyankar"),
    ("The Geometry of Numbers", "Manjul Bhargava"),
    ("Mathematics in Ancient India", "Kim Plofker"),
    ("Astronomy Across Cultures India", "Helaine Selin"),
    ("Introduction to Modeling with Python", "V.G. Kulkarni"),
    ("Social Change in Modern India", "M.N. Srinivas"),
    ("The Calculus of Variations", "Roddam Narasimha"),
    ("Biodiversity and Conservation", "M.S. Swaminathan"),
]  # 40 total

TECHNOLOGY = [
    ("Imagining India Technology Edition", "Nandan Nilekani"),
    ("Rebooting India Digital Transformation", "Nandan Nilekani"),
    ("Infosys Story of a Software Giant", "N.R. Narayana Murthy"),
    ("Leadership in the Digital Age", "N.R. Narayana Murthy"),
    ("The Future of Competition", "C.K. Prahalad"),
    ("Innovation at Base of Pyramid", "C.K. Prahalad"),
    ("The Other Side of Innovation", "Vijay Govindarajan"),
    ("Reverse Innovation in Healthcare", "Vijay Govindarajan"),
    ("Jugaad Innovation Technology", "Navi Radjou"),
    ("From Jugaad to Systematic Innovation", "Navi Radjou"),
    ("Frugal Innovation Tech Edition", "Navi Radjou"),
    ("Billions of Entrepreneurs Digital Age", "Tarun Khanna"),
    ("India's Tech Entrepreneurs", "Tarun Khanna"),
    ("Unscaled How Startups Win", "Hemant Taneja"),
    ("The Acceleration Imperative", "Hemant Taneja"),
    ("Platform Scale", "Sangeet Paul Choudary"),
    ("Platform Revolution India", "Sangeet Paul Choudary"),
    ("Shaping India's Tech Future", "Kiran Karnik"),
    ("The Coalition of Competitors", "Kiran Karnik"),
    ("The Infosys Effect", "Srinivasan Pillay"),
    ("Tech Values and Ethics", "Azim Premji"),
    ("Business Ethics Digital Age", "Ratan Tata"),
    ("Data Democracy India", "Avinash Collis"),
    ("Cybersecurity in India", "Gulshan Rai"),
    ("Digital Payments Revolution", "Dilip Asbe"),
    ("The Capitalmind Guide to Investing", "Deepak Shenoy"),
    ("Coffee Can Investing", "Saurabh Mukherjea"),
    ("The Wealth Creation Studies", "Raamdeo Agrawal"),
    ("India's AI Moment", "Prashanth Krish"),
    ("Easy Money India Trilogy Volume 1", "Vivek Kaul"),
    ("Easy Money India Trilogy Volume 2", "Vivek Kaul"),
    ("Easy Money India Trilogy Volume 3", "Vivek Kaul"),
    ("Indian Economy For Everyone", "Satyam Vyas"),
    ("The UPI Revolution", "Dilip Asbe"),
    ("India's Startup Ecosystem", "Shradha Sharma"),
]  # 35 total

ARTS = [
    # Rabindranath Tagore (10)
    ("Gitanjali", "Rabindranath Tagore"),
    ("The Crescent Moon", "Rabindranath Tagore"),
    ("The Gardener", "Rabindranath Tagore"),
    ("Gora", "Rabindranath Tagore"),
    ("The Home and the World", "Rabindranath Tagore"),
    ("My Reminiscences", "Rabindranath Tagore"),
    ("Creative Unity", "Rabindranath Tagore"),
    ("Sadhana The Realisation of Life", "Rabindranath Tagore"),
    ("The Religion of Man", "Rabindranath Tagore"),
    ("Nationalism", "Rabindranath Tagore"),
    # Girish Karnad (6)
    ("Tughlaq", "Girish Karnad"),
    ("Hayavadana", "Girish Karnad"),
    ("Naga-Mandala", "Girish Karnad"),
    ("Taledanda", "Girish Karnad"),
    ("The Fire and the Rain", "Girish Karnad"),
    ("The Dreams of Tipu Sultan", "Girish Karnad"),
    # Ravi Shankar (2)
    ("Raga Mala", "Ravi Shankar"),
    ("My Music My Life", "Ravi Shankar"),
    # Naseeruddin Shah (2)
    ("And Then One Day", "Naseeruddin Shah"),
    ("Reluctant Guru", "Naseeruddin Shah"),
    # Others (5)
    ("My Dateless Diary", "R.K. Narayan"),
    ("The Spirit of Indian Painting", "B.N. Goswamy"),
    ("Classical Indian Dance in Literature and the Arts", "Kapila Vatsyayan"),
    ("The Hindu View of Art", "Mulk Raj Anand"),
    ("Guru Dutt A Life in Cinema", "Nasreen Munni Kabir"),
]  # 25 total

HORROR = [
    # Ruskin Bond supernatural (6)
    ("A Season of Ghosts", "Ruskin Bond"),
    ("Ghost Stories from the Raj", "Ruskin Bond"),
    ("The House in the Woods", "Ruskin Bond"),
    ("Ghosts of a Hill Station", "Ruskin Bond"),
    ("Tales of the Supernatural", "Ruskin Bond"),
    ("Strange Men Strange Places", "Ruskin Bond"),
    # Satyajit Ray supernatural (5)
    ("The Unicorn Expedition", "Satyajit Ray"),
    ("Stranger in the Lake", "Satyajit Ray"),
    ("Indigo Stories", "Satyajit Ray"),
    ("Professor Shonku and the Artificial Intelligence", "Satyajit Ray"),
    ("Bankubabur Bandhu", "Satyajit Ray"),
    # Rabindranath Tagore supernatural (2)
    ("The Broken Nest Stories", "Rabindranath Tagore"),
    ("Stories of Death and Supernatural", "Rabindranath Tagore"),
    # Premendra Mitra (2)
    ("Ghanada Omnibus", "Premendra Mitra"),
    ("Supernatural Tales", "Premendra Mitra"),
    # Munshi Premchand (1)
    ("The Shroud and Other Stories", "Munshi Premchand"),
    # Anthologies (4)
    ("The Rupa Book of Great Horror Stories", "Various Indian Authors"),
    ("Dark Corners of India", "Various Indian Authors"),
    ("Horror Stories by Indian Authors", "Various Indian Authors"),
    ("Midnight Horror in India", "Various Indian Authors"),
]  # 20 total

# ── 100 Indian Members ──────────────────────────────────────────────
BORROWERS = [
    ("Arjun Sharma", "arjun.sharma@gmail.com", "9876543210"),
    ("Priya Nair", "priya.nair@gmail.com", "8765432109"),
    ("Rahul Verma", "rahul.verma@outlook.com", "7654321098"),
    ("Sneha Iyer", "sneha.iyer@yahoo.com", "9543210987"),
    ("Vikram Patel", "vikram.patel@gmail.com", "9988776655"),
    ("Deepa Menon", "deepa.menon@gmail.com", "8877665544"),
    ("Suresh Kumar", "suresh.kumar@gmail.com", "7766554433"),
    ("Anitha Rajagopalan", "anitha.r@gmail.com", "9655443322"),
    ("Karthik Bose", "karthik.bose@outlook.com", "9900112233"),
    ("Lakshmi Reddy", "lakshmi.reddy@gmail.com", "8811223344"),
    ("Mohan Krishnan", "mohan.krishnan@yahoo.com", "7722334455"),
    ("Pooja Gupta", "pooja.gupta@gmail.com", "9633445566"),
    ("Arun Nambiar", "arun.nambiar@gmail.com", "9944556677"),
    ("Divya Pillai", "divya.pillai@gmail.com", "8855667788"),
    ("Rajesh Joshi", "rajesh.joshi@gmail.com", "7766778899"),
    ("Meera Deshpande", "meera.d@outlook.com", "9677889900"),
    ("Sanjay Rao", "sanjay.rao@gmail.com", "9800123456"),
    ("Kavitha Subramaniam", "kavitha.s@gmail.com", "8700234567"),
    ("Nikhil Mehta", "nikhil.mehta@yahoo.com", "7600345678"),
    ("Ananya Chatterjee", "ananya.chatt@gmail.com", "9500456789"),
    ("Rohan Saxena", "rohan.saxena@outlook.com", "9400567890"),
    ("Swathi Bhatt", "swathi.bhatt@gmail.com", "8300678901"),
    ("Vinod Kulkarni", "vinod.kulkarni@gmail.com", "7200789012"),
    ("Padma Srinivasan", "padma.s@gmail.com", "9100890123"),
    ("Ashok Tiwari", "ashok.tiwari@gmail.com", "9500901234"),
    ("Geetha Venkatesh", "geetha.v@gmail.com", "8400012345"),
    ("Harish Pandey", "harish.pandey@outlook.com", "7300123456"),
    ("Indira Kaur", "indira.kaur@gmail.com", "9200234567"),
    ("Jayaram Nair", "jayaram.nair@yahoo.com", "9600345678"),
    ("Kamla Walia", "kamla.walia@gmail.com", "8500456789"),
    ("Lokesh Mishra", "lokesh.mishra@gmail.com", "7400567890"),
    ("Mamatha Hegde", "mamatha.hegde@gmail.com", "9300678901"),
    ("Nagesh Patil", "nagesh.patil@gmail.com", "9700789012"),
    ("Omkar Shinde", "omkar.shinde@outlook.com", "8600890123"),
    ("Parvathy Krishnamurthy", "parvathy.km@gmail.com", "7500901234"),
    ("Qasim Ali", "qasim.ali@gmail.com", "9400012345"),
    ("Rekha Bansal", "rekha.bansal@yahoo.com", "8300123456"),
    ("Sunil Aggarwal", "sunil.aggarwal@gmail.com", "7200234567"),
    ("Tanuja Desai", "tanuja.desai@gmail.com", "9100345678"),
    ("Uma Raman", "uma.raman@gmail.com", "9000456789"),
    ("Vivek Choudhury", "vivek.choudhury@outlook.com", "9900567890"),
    ("Wasim Khan", "wasim.khan@gmail.com", "8800678901"),
    ("Xavier Fernandez", "xavier.fernandez@gmail.com", "7700789012"),
    ("Yamuna Sivakumar", "yamuna.siva@yahoo.com", "9600890123"),
    ("Zaheer Hussain", "zaheer.hussain@gmail.com", "9500901234"),
    ("Abhinav Tripathi", "abhinav.tripathi@gmail.com", "8400012345"),
    ("Bharati Kulkarni", "bharati.kulkarni@gmail.com", "7300123456"),
    ("Chetan Malhotra", "chetan.malhotra@gmail.com", "9200234567"),
    ("Disha Shetty", "disha.shetty@outlook.com", "9600345678"),
    ("Esha Thakur", "esha.thakur@gmail.com", "8500456789"),
    ("Farhana Begum", "farhana.begum@gmail.com", "7400567890"),
    ("Gokul Krishnaswamy", "gokul.k@gmail.com", "9300678901"),
    ("Hemalatha Murthy", "hemalatha.m@gmail.com", "9700789012"),
    ("Ishaan Verma", "ishaan.verma@outlook.com", "8600890123"),
    ("Jayashree Naidu", "jayashree.naidu@gmail.com", "7500901234"),
    ("Kiran Bhat", "kiran.bhat@gmail.com", "9400012345"),
    ("Leela Iyer", "leela.iyer@yahoo.com", "8300123456"),
    ("Madhusudan Rao", "madhusudan.rao@gmail.com", "7200234567"),
    ("Nalini Chakraborty", "nalini.c@gmail.com", "9100345678"),
    ("Omvir Singh", "omvir.singh@gmail.com", "9000456789"),
    ("Preeti Agarwal", "preeti.agarwal@outlook.com", "9900567890"),
    ("Raghunath Pillai", "raghunath.p@gmail.com", "8800678901"),
    ("Savitha Kamath", "savitha.kamath@gmail.com", "7700789012"),
    ("Tarun Saxena", "tarun.saxena@yahoo.com", "9600890123"),
    ("Usha Sharma", "usha.sharma@gmail.com", "9500901234"),
    ("Vasantha Devi", "vasantha.devi@gmail.com", "8400012345"),
    ("Waqar Ahmed", "waqar.ahmed@gmail.com", "7300123456"),
    ("Yamini Reddy", "yamini.reddy@outlook.com", "9200234567"),
    ("Zoya Khanna", "zoya.khanna@gmail.com", "9600345678"),
    ("Aditya Narayan", "aditya.narayan@gmail.com", "8500456789"),
    ("Bhavana Menon", "bhavana.menon@gmail.com", "7400567890"),
    ("Chiranjeevi Rao", "chiranjeevi.rao@gmail.com", "9300678901"),
    ("Daksha Patel", "daksha.patel@gmail.com", "9700789012"),
    ("Fatima Siddiqui", "fatima.siddiqui@gmail.com", "7500901234"),
    ("Giridhar Swamy", "giridhar.swamy@gmail.com", "9400012345"),
    ("Haripriya Nair", "haripriya.nair@yahoo.com", "8300123456"),
    ("Inder Singh", "inder.singh@gmail.com", "7200234567"),
    ("Jyothi Lakshmi", "jyothi.lakshmi@gmail.com", "9100345678"),
    ("Kalpana Singh", "kalpana.singh@gmail.com", "9000456789"),
    ("Laxmikant Berde", "laxmikant.b@gmail.com", "9900567890"),
    ("Manohar Lal", "manohar.lal@gmail.com", "8800678901"),
    ("Nalinkanta Das", "nalinkanta.das@gmail.com", "7700789012"),
    ("Prabhakar Nair", "prabhakar.nair@gmail.com", "9500901234"),
    ("Radha Krishnan", "radha.krishnan@gmail.com", "8400012345"),
    ("Saritha Unnikrishnan", "saritha.u@gmail.com", "7300123456"),
    ("Tamizhselvan Kumar", "tamizhselvan.k@outlook.com", "9200234567"),
    ("Uday Shankar", "uday.shankar@gmail.com", "9600345678"),
    ("Vimala Devi", "vimala.devi@gmail.com", "8500456789"),
    ("Yashwant Rao", "yashwant.rao@gmail.com", "7400567890"),
    ("Zeeshaan Ali", "zeeshaan.ali@gmail.com", "9300678901"),
    ("Amarjeet Kaur", "amarjeet.kaur@gmail.com", "9700789012"),
    ("Balakrishna Murthy", "balakrishna.m@gmail.com", "8600890123"),
    ("Chandrika Prasad", "chandrika.p@gmail.com", "7500901234"),
    ("Dinesh Thakur", "dinesh.thakur@gmail.com", "9400012345"),
    ("Elangovan Pillai", "elangovan.p@yahoo.com", "8300123456"),
    ("Gopala Krishna", "gopala.krishna@gmail.com", "7200234567"),
    ("Hemanta Kumar", "hemanta.kumar@gmail.com", "9100345678"),
    ("Indrani Ghosh", "indrani.ghosh@gmail.com", "9000456789"),
]  # 100 total


def _isbn(cat_code: int, seq: int) -> str:
    return f"978-81-{cat_code:02d}-{seq:04d}-0"


def _compute_analytics(db):
    from sqlalchemy import func
    # Book popularity
    rows = (
        db.query(
            models.Book.book_id,
            models.Book.title,
            models.Book.author,
            models.Book.category,
            func.count(models.Transaction.transaction_id).label("cnt"),
        )
        .outerjoin(models.Transaction, models.Book.book_id == models.Transaction.book_id)
        .group_by(models.Book.book_id)
        .order_by(func.count(models.Transaction.transaction_id).desc())
        .all()
    )
    for r in rows:
        db.add(models.AnalyticsBookPopularity(
            book_id=r.book_id, title=r.title, author=r.author,
            category=r.category, borrow_count=r.cnt,
        ))

    # Monthly trends
    monthly = db.execute(text("""
        SELECT strftime('%Y', borrow_date) AS yr,
               strftime('%m', borrow_date) AS mo,
               COUNT(*) AS borrows,
               SUM(CASE WHEN return_date IS NOT NULL THEN 1 ELSE 0 END) AS returns
        FROM transactions
        GROUP BY yr, mo ORDER BY yr, mo
    """)).fetchall()
    for r in monthly:
        db.add(models.AnalyticsMonthlyTrend(
            year=int(r.yr), month=int(r.mo),
            period_label=f"{r.yr}-{r.mo}",
            total_borrows=r.borrows,
            total_returns=int(r.returns or 0),
        ))

    # Category stats
    cat_rows = db.execute(text("""
        SELECT b.category,
               COUNT(DISTINCT b.book_id) AS total_books,
               COUNT(t.transaction_id)   AS total_borrows,
               SUM(CASE WHEN b.availability_status='Borrowed' THEN 1 ELSE 0 END) AS currently_borrowed
        FROM books b
        LEFT JOIN transactions t ON b.book_id = t.book_id
        GROUP BY b.category
        ORDER BY total_borrows DESC
    """)).fetchall()
    for r in cat_rows:
        db.add(models.AnalyticsCategoryStats(
            category=r.category,
            total_books=r.total_books,
            total_borrows=r.total_borrows,
            currently_borrowed=int(r.currently_borrowed or 0),
        ))
    db.commit()


def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Clearing existing data...")
        db.execute(text("DELETE FROM analytics_book_popularity"))
        db.execute(text("DELETE FROM analytics_monthly_trend"))
        db.execute(text("DELETE FROM analytics_category_stats"))
        db.execute(text("DELETE FROM transactions"))
        db.execute(text("DELETE FROM books"))
        db.execute(text("DELETE FROM borrowers"))
        db.commit()

        # ── Insert 500 books ─────────────────────────────────────────
        print("Inserting 500 books by Indian authors...")
        category_data = [
            (FICTION,    "Fiction",      1),
            (HISTORY,    "History",      2),
            (NONFICTION, "Non-Fiction",  3),
            (FANTASY,    "Fantasy",      4),
            (MYSTERY,    "Mystery",      5),
            (SCIENCE,    "Science",      6),
            (TECHNOLOGY, "Technology",   7),
            (ARTS,       "Arts",         8),
            (HORROR,     "Horror",       9),
        ]
        for book_list, category, cat_code in category_data:
            for seq, (title, author) in enumerate(book_list, start=1):
                db.add(models.Book(
                    title=title, author=author, category=category,
                    isbn=_isbn(cat_code, seq), availability_status="Available",
                ))
        db.commit()

        # ── Insert 100 borrowers ─────────────────────────────────────
        print("Inserting 100 members...")
        for name, email, phone in BORROWERS:
            db.add(models.Borrower(borrower_name=name, email=email, phone=phone))
        db.commit()

        # ── Insert 300 transactions ──────────────────────────────────
        print("Inserting 300 transactions...")
        all_books    = db.query(models.Book).all()
        all_borrowers = db.query(models.Borrower).all()
        book_ids      = [b.book_id for b in all_books]
        borrower_ids  = [b.borrower_id for b in all_borrowers]
        now = datetime.utcnow()

        # Pick 100 distinct books to be currently borrowed (80 active + 20 overdue)
        active_ids = random.sample(book_ids, 100)
        active_set = set(active_ids)

        # 80 active loans (< 14 days, not yet overdue)
        for book_id in active_ids[:80]:
            db.add(models.Transaction(
                book_id=book_id,
                borrower_id=random.choice(borrower_ids),
                borrow_date=now - timedelta(days=random.randint(1, 13)),
                return_date=None,
            ))

        # 20 overdue loans (> 14 days, no return)
        for book_id in active_ids[80:]:
            db.add(models.Transaction(
                book_id=book_id,
                borrower_id=random.choice(borrower_ids),
                borrow_date=now - timedelta(days=random.randint(15, 60)),
                return_date=None,
            ))

        # Mark those 100 books as Borrowed
        db.query(models.Book).filter(models.Book.book_id.in_(active_ids)).update(
            {"availability_status": "Borrowed"}, synchronize_session=False
        )
        db.commit()

        # 200 historical completed transactions (any book, realistic spread)
        # Weight towards popular categories
        weighted_ids = (
            [b.book_id for b in all_books if b.category == "Fiction"] * 3 +
            [b.book_id for b in all_books if b.category in ("Fantasy", "History", "Non-Fiction")] * 2 +
            [b.book_id for b in all_books]
        )
        for _ in range(200):
            book_id     = random.choice(weighted_ids)
            borrow_date = now - timedelta(days=random.randint(30, 365))
            return_date = borrow_date + timedelta(days=random.randint(1, 14))
            db.add(models.Transaction(
                book_id=book_id,
                borrower_id=random.choice(borrower_ids),
                borrow_date=borrow_date,
                return_date=return_date,
            ))
        db.commit()

        # ── Compute analytics ────────────────────────────────────────
        print("Computing analytics cache...")
        _compute_analytics(db)

        books_count   = db.query(models.Book).count()
        borr_count    = db.query(models.Borrower).count()
        txn_count     = db.query(models.Transaction).count()
        active_count  = db.query(models.Transaction).filter(
            models.Transaction.return_date == None).count()
        print(f"\nDatabase seeded successfully!")
        print(f"  Books      : {books_count}")
        print(f"  Members    : {borr_count}")
        print(f"  Transactions: {txn_count} ({active_count} active)")

    finally:
        db.close()


if __name__ == "__main__":
    seed()
