const { Telegraf, Markup } = require('telegraf');
const { Client } = require('pg');

const bot = new Telegraf(process.env.BOT_TOKEN);

//config

module.exports.handler = async function (event, context) {
    console.log('Started!!!!!!!!');
    const message = JSON.parse(event.body);
    token = context.token.access_token;
    //config string

    const client = new Client({
        connectionString: conString,
        ssl: { rejectUnauthorized: true }
    });

    try {
        console.log('**********Trying***********');
        // console.log(message);

        await client.connect();
        console.log('**********Connected!!!!!!!!');
        console.log("USER: " + message.message.from.username);

        let currentUser = '';
        if (!message.message.from.username) {
            currentUser = message.message.from.first_name + ' ' + message.message.from.last_name;
        } else {
            currentUser = message.message.from.username;
        }

        const searchResult = await client.query("SELECT COUNT(*) FROM users_list WHERE username = $1", [currentUser]);
        console.log("Search result: " + searchResult.rows[0].count);

        const currentDate = new Date().toISOString().split('T')[0]; // Format the date to YYYY-MM-DD

        if (parseInt(searchResult.rows[0].count) == 0) {
            await client.query("INSERT INTO users_list(username, date, chatId ) VALUES($1, $2, $3)", [currentUser, currentDate, message.message.chat.id]);
            console.log("New user inserted");

            // Send welcome message to new users
            await bot.telegram.sendMessage(
                message.message.chat.id,
                'Привет, я бот команды Aranĝo 🖖. Пожалуйста нажмите на кнопку Главная для начала работы с сервисом или на одну из кнопок ниже 👇.',
                Markup.keyboard([
                    ['Мастера йоги'], // The button that users can click
                    ['Помощь']
                ]).resize().oneTime().extra()
            );
        }

    } catch (err) {
        console.error('Error connecting to the database:', err);
    } finally {
        await client.end();
        console.log('**********Disconnected!!!!!!!!');
    }

    await bot.handleUpdate(message);
    return {
        statusCode: 200,
        body: '',
    };
};

bot.start(async (ctx) => {
    const args = ctx.message.text.split(' '); // Get the parameters from the /start command
    const masterId = args[1]; // Assuming the first parameter is masterId
    
    if (!ctx.message.text) {
        await ctx.reply('Привет! Чтобы начать работу с ботом, пожалуйста, напишите команду /start');
    }
    if (!masterId) {
        return ctx.reply('Пожалуйста, выберете вашего мастера после команды /start и номер например: /start 1 или выберете одно из действий ниже 👇', Markup.keyboard([
            ['Мастера йоги'], // The button that users can click
            ['Помощь']
        ]).resize().oneTime());
       
    }
    //user config

    const client = new Client({
        connectionString: conString,
        ssl: { rejectUnauthorized: true }
    });

    try {
        await client.connect();

        // Query to fetch master's info
        const masterInfoRes = await client.query("SELECT * FROM master_info WHERE master_id = $1", [masterId]);
        const masterInfo = masterInfoRes.rows[0];
        // console.log('Info selected');

        // Query to fetch all images of the master
        const imagesRes = await client.query("SELECT base64image FROM master_images WHERE masterid = $1", [masterId]);
        const images = imagesRes.rows;
        // console.log('Images downloaded');

        const scheduleRes = await client.query("SELECT date FROM schedules WHERE master_id = $1 ORDER BY date", [masterId]);
        const scheduleDates = scheduleRes.rows;

        if (scheduleDates.length === 0) {
            ctx.reply('Расписание не найдено для указанного мастера.');
        } else {
            let masterInfoText = `Информация о мастере:\n`;
            if (masterInfo) {
                masterInfoText += `Биография: ${masterInfo.bio}\nКонтакт: ${masterInfo.contact}\n\n`;

                // Sending all master's photos
                if (images.length > 0) {
                    for (const image of images) {
                        await ctx.replyWithPhoto({ source: Buffer.from(image.base64image, 'base64') });
                    }
                } else {
                    ctx.reply('Изображения мастера не найдены.');
                }
            } else {
                masterInfoText += 'Информация о мастере не найдена.\n\n';
            }

            masterInfoText += 'Ваше расписание:\n';
            const buttons = scheduleDates.map(entry => [Markup.button.callback(entry.date.toISOString().split('T')[0], `date_${entry.date.toISOString().split('T')[0]}`)]);

            ctx.reply(masterInfoText, Markup.inlineKeyboard(buttons));
        }
    } catch (err) {
        console.error('Error fetching schedule:', err);
        ctx.reply('Произошла ошибка при получении расписания.');
    } finally {
        await client.end();
    }
});


bot.action(/^date_/, async (ctx) => {
    const date = ctx.callbackQuery.data.split('_')[1];
    const masterId = ctx.callbackQuery.message.text.split(' ')[1]; // Retrieve masterId based on your implementation context
    // const userId = ctx.callbackQuery.from.id; // Get the ID of the user who selected the date

   //user fetch

    const client = new Client({
        connectionString: conString,
        ssl: { rejectUnauthorized: true }
    });

    try {
        await client.connect();

        // Fetch the master's chat ID from the database (assuming it's stored)
        const masterInfoRes = await client.query("SELECT chatid FROM master_info WHERE master_id = 1");
        const masterInfo = masterInfoRes.rows[0];
                console.log('**************************Msater_info');

        console.log(masterInfo);

        if (!masterInfo) {
            ctx.reply('Информация о мастере не найдена.');
            return;
        }

        // Fetch the schedule for the selected date
        // const res = await client.query("SELECT info FROM schedules WHERE master_id = $1 AND date::date = $2::date", [masterId, date]);
        // const schedule = res.rows;

        // let scheduleText = `Расписание на ${date}:\n`;
        // schedule.forEach((entry) => {
        //     scheduleText += `- ${entry.info}\n`;
        // });

        // if (schedule.length === 0) {
        //     scheduleText = `Расписание не найдено на дату ${date}.`;
        // }

        // // Send the schedule details to the user
        // ctx.reply(scheduleText);

        // Construct the message to send to the master
        const messageToMaster = `Пользователь ${ctx.callbackQuery.from.username} выбрал дату ${date}.`;
        
        // Send message to the master
        // await bot.telegram.sendMessage(masterInfo.contact, messageToMaster);
        let hard_chat_id=211166438;
         await bot.telegram.sendMessage(hard_chat_id, messageToMaster);
        //  await bot.telegram.sendMessage(parseInt(masterInfo), messageToMaster);
        ctx.reply('Ваша встреча запланирована на '+ date+' мастер свяжется с вами!');
        
        const walletBotLink = 'https://t.me/wallet';
        const messageText = `Для оплаты пожалуйста ознакомтесь с инструкцией [Telegram Wallet Bot](${walletBotLink}).`;

        await ctx.replyWithMarkdown(messageText);
        
         await ctx.reply('Выберите дальнейшие действия:', Markup.keyboard([
            ['Мастера йоги'], // The button that users can click
            ['Помощь']
        ]).resize().oneTime());



    } catch (err) {
        console.error('Error fetching schedule and sending message:', err);
        ctx.reply('Произошла ошибка при получении расписания и отправке сообщения.');
    } finally {
        await client.end();
    }
});


bot.hears('Мастера йоги', async (ctx) => {
    //user fetch

    const client = new Client({
        connectionString: conString,
        ssl: { rejectUnauthorized: true }
    });

    try {
        await client.connect();

        const res = await client.query("SELECT id, first_name, last_name FROM masters");
        const masters = res.rows;

        if (masters.length === 0) {
            ctx.reply('Информация о мастерах не найдена.');
        } else {
            const buttons = masters.map(master => [Markup.button.callback(master.first_name+' '+master.last_name, `master_${master.id}`)]);
            ctx.reply('Выберите мастера:', Markup.inlineKeyboard(buttons));
        }
    } catch (err) {
        console.error('Error fetching masters:', err);
        ctx.reply('Произошла ошибка при получении информации о мастерах.');
    } finally {
        await client.end();
    }
});

bot.action(/^master_/, async (ctx) => {
    const masterId = ctx.callbackQuery.data.split('_')[1];
    const conString = "postgres://" + user + ":" + token + "@" + proxyEndpoint + "/" + proxyId + "?ssl=true";

    const client = new Client({
        connectionString: conString,
        ssl: { rejectUnauthorized: true }
    });

    try {
        await client.connect();

        // Query to fetch master's info
        const masterInfoRes = await client.query("SELECT * FROM master_info WHERE master_id = $1", [masterId]);
        const masterInfo = masterInfoRes.rows[0];

        // Query to fetch all images of the master
        const imagesRes = await client.query("SELECT base64image FROM master_images WHERE masterid = $1", [masterId]);
        const images = imagesRes.rows;

        const scheduleRes = await client.query("SELECT date FROM schedules WHERE master_id = $1 ORDER BY date", [masterId]);
        const scheduleDates = scheduleRes.rows;

        if (scheduleDates.length === 0) {
            ctx.reply('Расписание не найдено для указанного мастера.');
        } else {
            let masterInfoText = `Информация о мастере:\n`;
            if (masterInfo) {
                masterInfoText += `${masterInfo.bio} \n\n Контакт: ${masterInfo.contact}\n\n`;

                // Sending all master's photos
                if (images.length > 0) {
                    for (const image of images) {
                        await ctx.replyWithPhoto({ source: Buffer.from(image.base64image, 'base64') });
                    }
                } else {
                    ctx.reply('Изображения мастера не найдены.');
                }
            } else {
                masterInfoText += 'Информация о мастере не найдена.\n\n';
            }

            masterInfoText += 'Ваше расписание:\n';
            const buttons = scheduleDates.map(entry => [Markup.button.callback(entry.date.toISOString().split('T')[0], `date_${entry.date.toISOString().split('T')[0]}`)]);

            ctx.reply(masterInfoText, Markup.inlineKeyboard(buttons));
        }
    } catch (err) {
        console.error('Error fetching master info and schedule:', err);
        ctx.reply('Произошла ошибка при получении информации о мастере и его расписания.');
    } finally {
        await client.end();
    }
});


bot.help((ctx) => {
    ctx.reply(
        `Привет, ${ctx.message.from.username}.\n я бот команды Aranĝo 🖖. Пожалуйста нажмите на кнопку Главная для начала работы с сервисом или на одну из кнопок ниже 👇.`,
        Markup.keyboard([
            ['Мастера йоги'], // The button that users can click
            ['Помощь']
        ]).resize().oneTime()
    );
});

bot.on('text', (ctx) => {
    ctx.replyWithPhoto({ url: 'https://storage.yandexcloud.net/start-image/logotg.jpg' });
    ctx.reply(`Привет, ${ctx.message.from.username} я бот команды Aranĝo 🖖. Пожалуйста нажмите на кнопку Главная для начала работы с сервисом или на одну из кнопок ниже 👇.`,
    Markup.keyboard([
            ['Мастера йоги'], // The button that users can click
            ['Помощь']
        ]).resize().oneTime());
});


