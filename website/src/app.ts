import bodyParser from 'body-parser';
import express from 'express';
import hoganExpress from 'hogan-express';
import i18n from 'i18n';
import { join } from 'path';

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
  defaultLocale: 'zh',
  updateFiles: false,
  directory: join(__dirname, 'locales'),
});

const locales = i18n.getLocales();
app.get(`/:lang((${locales.join('|')})?)`, (req, res) => {
  const { lang } = req.params;
  const locale = locales.includes(lang) ? lang : req.locale;
  res.setLocale(locale);
  res.render('index', {
    locale,
    locales,
    defaultSitemapLocale: 'en',
    i18n: () => (text: string) => res.__(text),
    indexUrl: 'https://danmakucraft.com',
    bilibiliClientUrl: 'https://www.bilibili.com/video/BV1GW41177LA',
  });
});

app.get('*', (req, res) => {
  res.render('404');
});
