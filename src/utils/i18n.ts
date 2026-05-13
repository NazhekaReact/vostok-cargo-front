const translations: Record<string, Record<string, string>> = {
  // ======== Auth ========
  'app.title': { ru: 'Vostok Cargo', en: 'Vostok Cargo', kk: 'Vostok Cargo' },
  'auth.createAccount': { ru: 'Создайте аккаунт под свою роль', en: 'Create an account for your role', kk: 'Рөліңізге тіркелгі жасаңыз' },
  'auth.login': { ru: 'Войдите в аккаунт', en: 'Sign in to your account', kk: 'Тіркелгіге кіріңіз' },
  'auth.tabLogin': { ru: 'Вход', en: 'Login', kk: 'Кіру' },
  'auth.tabRegister': { ru: 'Регистрация', en: 'Register', kk: 'Тіркелу' },
  'auth.name': { ru: 'Имя', en: 'Name', kk: 'Аты' },
  'auth.email': { ru: 'Email', en: 'Email', kk: 'Email' },
  'auth.password': { ru: 'Пароль', en: 'Password', kk: 'Құпия сөз' },
  'auth.role': { ru: 'Роль', en: 'Role', kk: 'Рөл' },
  'auth.submit.create': { ru: 'Создать аккаунт', en: 'Create Account', kk: 'Тіркелгі жасау' },
  'auth.submit.login': { ru: 'Войти', en: 'Sign In', kk: 'Кіру' },
  'auth.submit.wait': { ru: 'Подождите...', en: 'Please wait...', kk: 'Күтіңіз...' },
  'auth.role.customer': { ru: 'Заказчик', en: 'Customer', kk: 'Тапсырыс беруші' },
  'auth.role.logistician': { ru: 'Логист', en: 'Logistician', kk: 'Логист' },
  'auth.role.driver': { ru: 'Водитель', en: 'Driver', kk: 'Жүргізуші' },

  // ======== Nav ========
  'nav.home': { ru: 'Главная', en: 'Home', kk: 'Басты' },
  'nav.fleet': { ru: 'Машины', en: 'Fleet', kk: 'Көліктер' },
  'nav.create': { ru: 'Создать', en: 'Create', kk: 'Жасау' },
  'nav.map': { ru: 'Карта', en: 'Map', kk: 'Карта' },
  'nav.menu': { ru: 'Меню', en: 'Menu', kk: 'Мәзір' },

  // ======== Customer Dashboard ========
  'customer.myOrders': { ru: 'Мои заказы', en: 'My Orders', kk: 'Менің тапсырыстарым' },
  'customer.inTransit': { ru: 'В пути', en: 'In Transit', kk: 'Жолда' },
  'customer.goToOrder': { ru: 'Перейти к заказу', en: 'Go to Order', kk: 'Тапсырысқа өту' },

  // ======== Create Order ========
  'create.title': { ru: 'Новый заказ', en: 'New Order', kk: 'Жаңа тапсырыс' },
  'create.manual': { ru: 'Вручную', en: 'Manual', kk: 'Қолмен' },
  'create.aiHelper': { ru: 'AI Помощник', en: 'AI Helper', kk: 'AI Көмекші' },
  'create.smartFill': { ru: 'Умное заполнение', en: 'Smart Fill', kk: 'Ақылды толтыру' },
  'create.smartFillHint': { ru: 'Просто опишите, что и куда нужно отвезти. ИИ сам заполнит форму.', en: 'Just describe what needs to be delivered and where. AI will fill the form.', kk: 'Нені қайда жеткізу керектігін сипаттаңыз. AI формаларды толтырады.' },
  'create.fillForm': { ru: 'Заполнить форму ', en: 'Fill Form ', kk: 'Форманы толтыру ' },
  'create.parsing': { ru: 'Распознаю...', en: 'Parsing...', kk: 'Талдау...' },
  'create.route': { ru: 'Маршрут', en: 'Route', kk: 'Маршрут' },
  'create.fromCity': { ru: 'Город отправления', en: 'City of origin', kk: 'Жіберу қаласы' },
  'create.fromAddress': { ru: 'Адрес отправления', en: 'Pickup address', kk: 'Жіберу мекенжайы' },
  'create.toCity': { ru: 'Город доставки', en: 'Destination city', kk: 'Жеткізу қаласы' },
  'create.toAddress': { ru: 'Адрес доставки', en: 'Delivery address', kk: 'Жеткізу мекенжайы' },
  'create.cargo': { ru: 'Груз', en: 'Cargo', kk: 'Жүк' },
  'create.cargoDesc': { ru: 'Описание груза', en: 'Cargo description', kk: 'Жүк сипаттамасы' },
  'create.weight': { ru: 'Вес (кг)', en: 'Weight (kg)', kk: 'Салмақ (кг)' },
  'create.volume': { ru: 'Объем (м³)', en: 'Volume (m³)', kk: 'Көлем (м³)' },
  'create.details': { ru: 'Детали', en: 'Details', kk: 'Мәліметтер' },
  'create.price': { ru: 'Предлагаемая цена', en: 'Suggested price', kk: 'Ұсынылатын баға' },
  'create.submit': { ru: 'Создать', en: 'Create', kk: 'Жасау' },
  'create.submitting': { ru: 'Создание...', en: 'Creating...', kk: 'Жасалуда...' },

  // ======== Order Details ========
  'order.details': { ru: 'Детали заказа', en: 'Order Details', kk: 'Тапсырыс мәліметтері' },
  'order.from': { ru: 'Откуда', en: 'From', kk: 'Қайдан' },
  'order.to': { ru: 'Куда', en: 'To', kk: 'Қайда' },
  'order.notSpecified': { ru: 'Не указано', en: 'Not specified', kk: 'Көрсетілмеген' },
  'order.cargo': { ru: 'Груз', en: 'Cargo', kk: 'Жүк' },
  'order.description': { ru: 'Описание', en: 'Description', kk: 'Сипаттама' },
  'order.weight': { ru: 'Вес', en: 'Weight', kk: 'Салмақ' },
  'order.volume': { ru: 'Объем', en: 'Volume', kk: 'Көлем' },
  'order.customerPrice': { ru: 'Цена заказчика', en: 'Customer price', kk: 'Тапсырыс беруші бағасы' },
  'order.negotiable': { ru: 'Договорная', en: 'Negotiable', kk: 'Келісім бойынша' },
  'order.bids': { ru: 'Предложения', en: 'Bids', kk: 'Ұсыныстар' },
  'order.accept': { ru: 'Принять', en: 'Accept', kk: 'Қабылдау' },
  'order.executor': { ru: 'Исполнитель', en: 'Executor', kk: 'Орындаушы' },
  'order.logistician': { ru: 'Логист:', en: 'Logistician:', kk: 'Логист:' },
  'order.vehicle': { ru: 'Машина', en: 'Vehicle', kk: 'Көлік' },
  'order.tracking': { ru: 'Отслеживание на карте', en: 'Track on map', kk: 'Картадан бақылау' },
  'order.unknown': { ru: 'Неизвестно', en: 'Unknown', kk: 'Белгісіз' },

  // ======== Profile Menu ========
  'menu.yourCompany': { ru: 'Ваша компания', en: 'Your Company', kk: 'Сіздің компания' },
  'menu.changeCompany': { ru: 'Изменить компанию ', en: 'Change Company ', kk: 'Компанияны өзгерту ' },
  'menu.geolocation': { ru: 'Геопозиция', en: 'Geolocation', kk: 'Геолокация' },
  'menu.settings': { ru: 'Настройки', en: 'Settings', kk: 'Баптаулар' },
  'menu.privacy': { ru: 'Конфиденциальность', en: 'Privacy', kk: 'Құпиялық' },
  'menu.language': { ru: 'Язык', en: 'Language', kk: 'Тіл' },
  'menu.darkTheme': { ru: 'Тёмная тема', en: 'Dark Theme', kk: 'Қараңғы тақырып' },
  'menu.logout': { ru: 'Выйти', en: 'Sign Out', kk: 'Шығу' },
  'menu.yourId': { ru: 'Ваш ID:', en: 'Your ID:', kk: 'Сіздің ID:' },

  // ======== Language Selector ========
  'lang.title': { ru: 'Выберите язык', en: 'Select Language', kk: 'Тілді таңдаңыз' },

  // ======== Driver Dashboard ========
  'driver.title': { ru: 'Панель водителя', en: 'Driver Dashboard', kk: 'Жүргізуші панелі' },
  'driver.gps': { ru: 'GPS Трансляция', en: 'GPS Broadcast', kk: 'GPS Трансляция' },
  'driver.gpsActive': { ru: 'Трансляция активна', en: 'Broadcast active', kk: 'Трансляция белсенді' },
  'driver.gpsOff': { ru: 'Трансляция выключена', en: 'Broadcast off', kk: 'Трансляция өшірілген' },
  'driver.testGps': { ru: 'Тест GPS', en: 'Test GPS', kk: 'GPS Тест' },
  'driver.currentTrip': { ru: 'Текущий рейс', en: 'Current Trip', kk: 'Ағымдағы рейс' },
  'driver.noTrip': { ru: 'Нет активного рейса', en: 'No active trip', kk: 'Белсенді рейс жоқ' },
  'driver.arrivedPickup': { ru: 'Прибыл на погрузку', en: 'Arrived at Pickup', kk: 'Тиеуге жеттім' },
  'driver.startTrip': { ru: 'Начать рейс', en: 'Start Trip', kk: 'Рейсті бастау' },
  'driver.arrivedDrop': { ru: 'Прибыл на выгрузку', en: 'Arrived at Drop', kk: 'Түсіруге жеттім' },
  'driver.uploadPod': { ru: 'Загрузить фотоотчет (PoD)', en: 'Upload Photo Report (PoD)', kk: 'Фотоесеп жүктеу (PoD)' },
  'driver.finishTrip': { ru: 'Завершить рейс', en: 'Finish Trip', kk: 'Рейсті аяқтау' },
  'driver.allOrders': { ru: 'Все заказы', en: 'All Orders', kk: 'Барлық тапсырыстар' },
  'driver.updating': { ru: 'Обновляю...', en: 'Updating...', kk: 'Жаңартылуда...' },

  // ======== Logistician Dashboard ========
  'logist.title': { ru: 'Кабинет Логиста', en: 'Logistician Dashboard', kk: 'Логист кабинеті' },
  'logist.exchange': { ru: 'Биржа', en: 'Exchange', kk: 'Биржа' },
  'logist.inWork': { ru: 'В работе', en: 'In Progress', kk: 'Жұмыста' },
  'logist.placeBid': { ru: 'Сделать ставку', en: 'Place Bid', kk: 'Ұсыныс беру' },
  'logist.assignVehicle': { ru: 'Назначить машину', en: 'Assign Vehicle', kk: 'Көлік тағайындау' },
  'logist.amount': { ru: 'Сумма', en: 'Amount', kk: 'Сома' },
  'logist.comment': { ru: 'Комментарий', en: 'Comment', kk: 'Пікір' },
  'logist.send': { ru: 'Отправить', en: 'Send', kk: 'Жіберу' },
  'logist.sending': { ru: 'Отправка...', en: 'Sending...', kk: 'Жіберілуде...' },
  'logist.cancel': { ru: 'Отмена', en: 'Cancel', kk: 'Бас тарту' },
  'logist.assignTitle': { ru: 'Назначение на рейс', en: 'Trip Assignment', kk: 'Рейске тағайындау' },
  'logist.selectVehicle': { ru: 'Выберите машину', en: 'Select Vehicle', kk: 'Көлік таңдаңыз' },
  'logist.selectDriver': { ru: 'Выберите водителя', en: 'Select Driver', kk: 'Жүргізуші таңдаңыз' },
  'logist.noVehicles': { ru: 'Машин пока нет', en: 'No vehicles yet', kk: 'Көліктер жоқ' },
  'logist.noDrivers': { ru: 'Водителей пока нет', en: 'No drivers yet', kk: 'Жүргізушілер жоқ' },
  'logist.assign': { ru: 'Назначить', en: 'Assign', kk: 'Тағайындау' },
  'logist.assigning': { ru: 'Назначаю...', en: 'Assigning...', kk: 'Тағайындалуда...' },

  // ======== Fleet ========
  'fleet.title': { ru: 'Мой автопарк', en: 'My Fleet', kk: 'Менің автопарк' },
  'fleet.cars': { ru: 'Машины', en: 'Vehicles', kk: 'Көліктер' },
  'fleet.drivers': { ru: 'Водители', en: 'Drivers', kk: 'Жүргізушілер' },
  'fleet.type': { ru: 'Тип', en: 'Type', kk: 'Түрі' },
  'fleet.capacity': { ru: 'Г/П', en: 'Payload', kk: 'Жүк к.' },
  'fleet.volume': { ru: 'Объем', en: 'Volume', kk: 'Көлем' },
  'fleet.noDriver': { ru: 'Нет водителя', en: 'No driver', kk: 'Жүргізуші жоқ' },
  'fleet.change': { ru: 'Изменить', en: 'Change', kk: 'Өзгерту' },
  'fleet.noCars': { ru: 'Машин пока нет', en: 'No vehicles yet', kk: 'Көліктер жоқ' },
  'fleet.noDrivers': { ru: 'Водителей пока нет', en: 'No drivers yet', kk: 'Жүргізушілер жоқ' },
  'fleet.addVehicle': { ru: 'Добавить машину', en: 'Add Vehicle', kk: 'Көлік қосу' },
  'fleet.brand': { ru: 'Марка и модель', en: 'Brand and model', kk: 'Маркасы мен моделі' },
  'fleet.plateNumber': { ru: 'Гос. номер', en: 'Plate number', kk: 'Мемл. нөмірі' },
  'fleet.bodyType': { ru: 'Тип кузова', en: 'Body type', kk: 'Кузов түрі' },
  'fleet.weightKg': { ru: 'Вес (кг)', en: 'Weight (kg)', kk: 'Салмақ (кг)' },
  'fleet.volumeM3': { ru: 'Объем (м³)', en: 'Volume (m³)', kk: 'Көлем (м³)' },
  'fleet.save': { ru: 'Сохранить', en: 'Save', kk: 'Сақтау' },
  'fleet.saving': { ru: 'Сохраняю...', en: 'Saving...', kk: 'Сақталуда...' },
  'fleet.addDriver': { ru: 'Добавить водителя', en: 'Add Driver', kk: 'Жүргізуші қосу' },
  'fleet.add': { ru: 'Добавить', en: 'Add', kk: 'Қосу' },
  'fleet.adding': { ru: 'Добавляю...', en: 'Adding...', kk: 'Қосылуда...' },
  'fleet.truck20': { ru: 'Фура 20т', en: 'Truck 20t', kk: 'Фура 20т' },
  'fleet.truck10': { ru: 'Грузовик 10т', en: 'Truck 10t', kk: 'Жүк көлігі 10т' },

  // ======== Tracker ========
  'tracker.title': { ru: 'Карта', en: 'Map', kk: 'Карта' },
  'tracker.integration': { ru: 'Интеграция с react-native-maps', en: 'Integration with react-native-maps', kk: 'react-native-maps интеграциясы' },

  // ======== Order statuses ========
  'status.PUBLISHED': { ru: 'Опубликован', en: 'Published', kk: 'Жарияланған' },
  'status.NEGOTIATION': { ru: 'Торг', en: 'Negotiation', kk: 'Келіссөз' },
  'status.ASSIGNED': { ru: 'Назначен', en: 'Assigned', kk: 'Тағайындалған' },
  'status.APPROVED': { ru: 'Принят', en: 'Approved', kk: 'Қабылданған' },
  'status.AT_PICKUP': { ru: 'На погрузке', en: 'At Pickup', kk: 'Тиеуде' },
  'status.IN_TRANSIT': { ru: 'В пути', en: 'In Transit', kk: 'Жолда' },
  'status.AT_DROP': { ru: 'На выгрузке', en: 'At Drop-off', kk: 'Түсіруде' },
  'status.DELIVERED': { ru: 'Завершен', en: 'Delivered', kk: 'Жеткізілді' },

  // ======== Privacy ========
  'privacy.title': { ru: 'Конфиденциальность', en: 'Privacy Policy', kk: 'Құпиялық саясаты' },
  'privacy.section1.title': { ru: 'Сбор данных', en: 'Data Collection', kk: 'Деректерді жинау' },
  'privacy.section1.text': {
    ru: 'Мы собираем только те данные, которые необходимы для работы сервиса грузоперевозок: ваше имя, email, номер телефона, данные о компании и маршрутах перевозок. Геолокация собирается только при вашем явном согласии и используется для отслеживания грузов в реальном времени.',
    en: 'We collect only the data necessary for the freight service: your name, email, phone number, company data, and shipment routes. Geolocation is collected only with your explicit consent and is used for real-time cargo tracking.',
    kk: 'Біз тек жүк тасымалдау қызметіне қажетті деректерді ғана жинаймыз: сіздің атыңыз, email, телефон нөміріңіз, компания деректері және тасымалдау маршруттары. Геолокация тек сіздің анық келісіміңізбен жиналады және жүктерді нақты уақытта бақылау үшін пайдаланылады.',
  },
  'privacy.section2.title': { ru: 'Использование данных', en: 'Data Usage', kk: 'Деректерді пайдалану' },
  'privacy.section2.text': {
    ru: 'Ваши персональные данные используются исключительно для обработки заказов, обеспечения связи между заказчиками, логистами и водителями, а также для улучшения качества сервиса. Мы не передаём ваши данные третьим лицам без вашего согласия.',
    en: 'Your personal data is used exclusively for processing orders, enabling communication between customers, logisticians, and drivers, and improving service quality. We do not share your data with third parties without your consent.',
    kk: 'Сіздің жеке деректеріңіз тек тапсырыстарды өңдеу, тапсырыс берушілер, логистер мен жүргізушілер арасындағы байланысты қамтамасыз ету және қызмет сапасын жақсарту үшін пайдаланылады. Біз сіздің деректеріңізді сіздің келісіміңізсіз үшінші тұлғаларға бермейміз.',
  },
  'privacy.section3.title': { ru: 'Безопасность', en: 'Security', kk: 'Қауіпсіздік' },
  'privacy.section3.text': {
    ru: 'Мы применяем современные методы шифрования и защиты данных. Доступ к персональным данным имеют только авторизованные сотрудники. Все пароли хранятся в зашифрованном виде, а передача данных осуществляется по защищённым каналам.',
    en: 'We use modern encryption and data protection methods. Only authorized personnel have access to personal data. All passwords are stored in encrypted form, and data is transmitted through secure channels.',
    kk: 'Біз деректерді шифрлаудың және қорғаудың заманауи әдістерін қолданамыз. Жеке деректерге тек уәкілетті қызметкерлер қол жеткізе алады. Барлық құпия сөздер шифрланған түрде сақталады, деректер қорғалған арналар арқылы тасымалданады.',
  },
  'privacy.section4.title': { ru: 'Ваши права', en: 'Your Rights', kk: 'Сіздің құқықтарыңыз' },
  'privacy.section4.text': {
    ru: 'Вы имеете право запросить доступ к своим данным, их исправление или удаление. Для этого свяжитесь с нами через раздел «Меню» или напишите на почту поддержки. Мы обработаем ваш запрос в течение 30 дней.',
    en: 'You have the right to request access to your data, its correction, or deletion. To do so, contact us via the "Menu" section or write to our support email. We will process your request within 30 days.',
    kk: 'Сіз деректеріңізге қол жеткізуді, оларды түзетуді немесе жоюды сұрауға құқылысыз. Ол үшін «Мәзір» бөлімі арқылы немесе қолдау электрондық поштасына хабарласыңыз. Біз сіздің сұрауыңызды 30 күн ішінде өңдейміз.',
  },
};

export function t(key: string, language: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[language] || entry['ru'] || key;
}

export default t;
