# Простой GUI для образовательного стенда

### Установка
Для установки потребуется загрузить образ raspbian desktop на флешку. Скачать его можно с [официального сайта](https://www.raspberrypi.org/downloads/raspbian/). Для загрузки образа хорошо подойдет вот эта [утилита](https://www.balena.io/etcher/).

После записи образа для корректной работы raspberry с экраном стоит сразу отредактировать файлы config.txt и cmdline.txt. Для этого нужно сначала извлечь флешку, потом вставить её снова, тогда windows откроет загрузочный раздел системы (другой раздел недоступен, поскольку тип файловой системы там несовместим с виндой, если винда предложит отформатировать его, отказываемся).
Находим в загрузочном разделе файл config.txt и добавляем в конец строки  
  max_usb_current=1  
  hdmi_group=2  
  hdmi_mode=87  
  hdmi_cvt 1024 600 60 6 0 0 0  
  hdmi_drive=1  
  enable_uart=1  
Из файла cmdline.txt убираем фразу `console=serial0,115200`

Теперь вставляем флешку в raspberry и запитываем её от 5 вольтового блока питания.  
После запуска требуется первоначальная настройка системы, тут все просто - система сама будет предлагать что делать, нужно просто вводить верные данные.  
После настройки можно перезагрузиться, как это предложить система.

После перезагрузки устанавливаем git. Для этого открываем терминал (`ctrl+alt+t` или просто щелкнуть на значок в системной трее) и вводим команду `sudo apt-get install -y git`  
После утановки скачиваем репозиторий коммандой `git clone https://github.com/SonikDropout/booster-ui.git`   
Теперь переходим в директрорию с исходниками командой `cd booster-ui`. Перед сборкой приложение необходими отредактировать один файл для указания типа разгонного блока. Вводим команду `nano ./src/constants.js`, находим строчку, начинающуюся с `isSmallBlock =` и меням флаг на `true` если блок маленький или `false` если большой. Для выхода из редактора жмём `ctrl+x`, подтвержаем сохранение и вываливаемся обратно в терминал.    
Теперь запускаем установочный скрипт командами  
  `chmod +x install.sh`  
  `./install.sh`  

На этом работа по утановке ПО заканчивается.

### Подключение к стенду

Для подключения к стенду помимо очевидных манипулций для оживления экрана с помощью кабелей USB и HDMI потребуется подключить GPIO. Нам нужны 14 и 15 пины. Схема распиновки:

![gpio](https://www.raspberrypi.org/documentation/usage/gpio/images/GPIO.png)

Пин 14 использутеся для передачи, пин 15 для приема сигнала.
