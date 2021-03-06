/* @flow */

const english = {
  'languageKey': 'eng',
  'dateFormat': '%A, %B %e, %Y',
  'timeFormat': '%l:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Jan',
  'FebShort': 'Feb',
  'MarShort': 'Mar',
  'AprShort': 'Apr',
  'MayShort': 'May',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Aug',
  'SepShort': 'Sep',
  'OctShort': 'Oct',
  'NovShort': 'Nov',
  'DecShort': 'Dec',
  'SunShort': 'Sun',
  'MonShort': 'Mon',
  'TueShort': 'Tue',
  'WedShort': 'Wed',
  'ThuShort': 'Thu',
  'FriShort': 'Fri',
  'SatShort': 'Sat',
  'JanLong': 'January',
  'FebLong': 'February',
  'MarLong': 'March',
  'AprLong': 'April',
  'MayLong': 'May',
  'JunLong': 'June',
  'JulLong': 'July',
  'AugLong': 'August',
  'SepLong': 'September',
  'OctLong': 'October',
  'NovLong': 'November',
  'DecLong': 'December',
  'SunLong': 'Sunday',
  'MonLong': 'Monday',
  'TueLong': 'Tuesday',
  'WedLong': 'Wednesday',
  'ThuLong': 'Thursday',
  'FriLong': 'Friday',
  'SatLong': 'Saturday'
};

const french = {
  'languageKey': 'fre',
  'dateFormat': '%a %e %b %y',
  'timeFormat': '%k:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Jan',
  'FebShort': 'Fév',
  'MarShort': 'Mar',
  'AprShort': 'Avr',
  'MayShort': 'Mai',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Aou',
  'SepShort': 'Sep',
  'OctShort': 'Oct',
  'NovShort': 'Nov',
  'DecShort': 'Déc',
  'SunShort': 'Dim',
  'MonShort': 'Lun',
  'TueShort': 'Mar',
  'WedShort': 'Mer',
  'ThuShort': 'Jeu',
  'FriShort': 'Ven',
  'SatShort': 'Sam',
  'JanLong': 'Janvier',
  'FebLong': 'Février',
  'MarLong': 'Mars',
  'AprLong': 'Avril',
  'MayLong': 'Mai',
  'JunLong': 'Juin',
  'JulLong': 'Juillet',
  'AugLong': 'Aout',
  'SepLong': 'Septembre',
  'OctLong': 'Octobre',
  'NovLong': 'Novembre',
  'DecLong': 'Décembre',
  'SunLong': 'Dimanche',
  'MonLong': 'Lundi',
  'TueLong': 'Mardi',
  'WedLong': 'Mercredi',
  'ThuLong': 'Jeudi',
  'FriLong': 'Vendredi',
  'SatLong': 'Samedi'
};

const italian = {
  'languageKey': 'ita',
  'dateFormat': '%A, %B %e, %Y',
  'timeFormat': '%l:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Gen',
  'FebShort': 'Feb',
  'MarShort': 'Mar',
  'AprShort': 'Apr',
  'MayShort': 'Mag',
  'JunShort': 'Giu',
  'JulShort': 'Lug',
  'AugShort': 'Ago',
  'SepShort': 'Set',
  'OctShort': 'Ott',
  'NovShort': 'Nov',
  'DecShort': 'Dic',
  'SunShort': 'Dom',
  'MonShort': 'Lun',
  'TueShort': 'Mar',
  'WedShort': 'Mer',
  'ThuShort': 'Gio',
  'FriShort': 'Ven',
  'SatShort': 'Sab',
  'JanLong': 'Gennaio',
  'FebLong': 'Febbraio',
  'MarLong': 'Marzo',
  'AprLong': 'Aprile',
  'MayLong': 'Maggio',
  'JunLong': 'Giugno',
  'JulLong': 'Luglio',
  'AugLong': 'Agosto',
  'SepLong': 'Settembre',
  'OctLong': 'Ottobre',
  'NovLong': 'Novembre',
  'DecLong': 'Dicembre',
  'SunLong': 'Domenica',
  'MonLong': 'Lunedì',
  'TueLong': 'Martedì',
  'WedLong': 'Mercoledì',
  'ThuLong': 'Giovedì',
  'FriLong': 'Venerdì',
  'SatLong': 'Sabato'
};

const german = {
  'languageKey': 'ger',
  'dateFormat': '%A, %e. %B %Y',
  'timeFormat': '%k:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Jan',
  'FebShort': 'Feb',
  'MarShort': 'Mär',
  'AprShort': 'Apr',
  'MayShort': 'Mai',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Aug',
  'SepShort': 'Set',
  'OctShort': 'Okt',
  'NovShort': 'Nov',
  'DecShort': 'Dez',
  'SunShort': 'So',
  'MonShort': 'Mo',
  'TueShort': 'Di',
  'WedShort': 'Mi',
  'ThuShort': 'Do',
  'FriShort': 'Fr',
  'SatShort': 'Sa',
  'JanLong': 'Januar',
  'FebLong': 'Februar',
  'MarLong': 'März',
  'AprLong': 'April',
  'MayLong': 'Mai',
  'JunLong': 'Juni',
  'JulLong': 'Juli',
  'AugLong': 'August',
  'SepLong': 'September',
  'OctLong': 'Oktober',
  'NovLong': 'November',
  'DecLong': 'Dezember',
  'SunLong': 'Sonntag',
  'MonLong': 'Montag',
  'TueLong': 'Dienstag',
  'WedLong': 'Mittwoch',
  'ThuLong': 'Donnerstag',
  'FriLong': 'Freitag',
  'SatLong': 'Samstag'
};

const spanish = {
  'languageKey': 'spa',
  'dateFormat': '%A, %e de %B, %Y',
  'timeFormat': '%k:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Ene',
  'FebShort': 'Feb',
  'MarShort': 'Mar',
  'AprShort': 'Abr',
  'MayShort': 'May',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Ago',
  'SepShort': 'Sep',
  'OctShort': 'Oct',
  'NovShort': 'Nov',
  'DecShort': 'Dic',
  'SunShort': 'Dom',
  'MonShort': 'Lun',
  'TueShort': 'Mar',
  'WedShort': 'Mié',
  'ThuShort': 'Jue',
  'FriShort': 'Vie',
  'SatShort': 'Sáb',
  'JanLong': 'Enero',
  'FebLong': 'Febrero',
  'MarLong': 'Marzo',
  'AprLong': 'Abril',
  'MayLong': 'Mayo',
  'JunLong': 'Junio',
  'JulLong': 'Julio',
  'AugLong': 'Agosto',
  'SepLong': 'Septiembre',
  'OctLong': 'Octubre',
  'NovLong': 'Noviembre',
  'DecLong': 'Diciembre',
  'SunLong': 'Domingo',
  'MonLong': 'Lunes',
  'TueLong': 'Martes',
  'WedLong': 'Miércoles',
  'ThuLong': 'Jueves',
  'FriLong': 'Viernes',
  'SatLong': 'Sábado'
};

const dutch = {
  'languageKey': 'dut',
  'dateFormat': '%A, %e. %B %Y',
  'timeFormat': '%k:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Jan',
  'FebShort': 'Feb',
  'MarShort': 'Mar',
  'AprShort': 'Apr',
  'MayShort': 'Mei',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Aug',
  'SepShort': 'Sep',
  'OctShort': 'Okt',
  'NovShort': 'Nov',
  'DecShort': 'Dec',
  'SunShort': 'Zo',
  'MonShort': 'Ma',
  'TueShort': 'Di',
  'WedShort': 'Wo',
  'ThuShort': 'Do',
  'FriShort': 'Vr',
  'SatShort': 'Za',
  'JanLong': 'Januari',
  'FebLong': 'Februari',
  'MarLong': 'Maart',
  'AprLong': 'April',
  'MayLong': 'Mei',
  'JunLong': 'Juni',
  'JulLong': 'Juli',
  'AugLong': 'Augustus',
  'SepLong': 'September',
  'OctLong': 'Oktober',
  'NovLong': 'November',
  'DecLong': 'December',
  'SunLong': 'Zondag',
  'MonLong': 'Maandag',
  'TueLong': 'Dinsdag',
  'WedLong': 'Woensdag',
  'ThuLong': 'Donderdag',
  'FriLong': 'Vrijdag',
  'SatLong': 'Zaterdag'
};

const swedish = {
  'languageKey': 'swe',
  'dateFormat': '%y/%m/%d',
  'timeFormat': '%H:%M',
  'AMFormat': 'AM',
  'PMFormat': 'PM',
  'JanShort': 'Jan',
  'FebShort': 'Feb',
  'MarShort': 'Mar',
  'AprShort': 'Apr',
  'MayShort': 'Maj',
  'JunShort': 'Jun',
  'JulShort': 'Jul',
  'AugShort': 'Aug',
  'SepShort': 'Sep',
  'OctShort': 'Okt',
  'NovShort': 'Nov',
  'DecShort': 'Dec',
  'SunShort': 'Sön',
  'MonShort': 'Mån',
  'TueShort': 'Tis',
  'WedShort': 'Ons',
  'ThuShort': 'Tor',
  'FriShort': 'Fre',
  'SatShort': 'Lör',
  'JanLong': 'Januari',
  'FebLong': 'Februari',
  'MarLong': 'Mars',
  'AprLong': 'April',
  'MayLong': 'Maj',
  'JunLong': 'Juni',
  'JulLong': 'Juli',
  'AugLong': 'Augusti',
  'SepLong': 'September',
  'OctLong': 'Oktober',
  'NovLong': 'November',
  'DecLong': 'December',
  'SunLong': 'Söndag',
  'MonLong': 'Måndag',
  'TueLong': 'Tisdag',
  'WedLong': 'Onsdag',
  'ThuLong': 'Torsdag',
  'FriLong': 'Fredag',
  'SatLong': 'Lördag'
};

export default class LocalizationResources {

  localizationResourcesDictionary: Object;
  
  constructor() {
    this.localizationResourcesDictionary = {
      'english': english,
      'french': french,
      'italian': italian,
      'german': german,
      'spanish': spanish,
      'dutch': dutch,
      'swedish': swedish
    };
  }

  getLocalizationResourcesDictionary() {
    return this.localizationResourcesDictionary;
  }
}

