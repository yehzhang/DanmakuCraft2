import bodyParser from 'body-parser';
import express from 'express';
import hoganExpress from 'hogan-express';
import i18n from 'i18n';
import { join } from 'path';
import './hoganExpress';

app.engine('mustache', hoganExpress);
app.set('view engine', 'mustache');
app.set('views', join(__dirname, 'view'));
app.set('layout', 'layout');
app.enable('view cache');

app.use(express.static(join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(i18n.init);
i18n.configure({
  // TODO fallback en* to en-US
  // TODO fallback zh* to zh-CN
  // TODO fallback all other to zh
  defaultLocale: 'zh-CN',
  // queryParameter: 'lang',
  directory: join(__dirname, 'locales'),
});

app.get('/', (req, res) => {
  res.render('index', {
    locale: req.locale,
    i18n: () => (text: string) => req.__(text),
  });
});
