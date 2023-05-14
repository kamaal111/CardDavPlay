import compactMap from '../utils/compactMap';

import type {Result} from '../types';

interface VCardParams {
  firstName: string;
  lastName?: string;
  phones: {type: string; number: string}[];
  nickname?: string;
}

class VCard {
  firstName: string;
  lastName?: string;
  phones: {type: string; number: string}[];
  nickname?: string;

  constructor(params: VCardParams) {
    this.firstName = params.firstName.trim();
    this.lastName = params.lastName?.trim();
    this.phones = params.phones;
    this.nickname = params.nickname?.trim();
  }

  make(): Result<string, VCardMakeError> {
    const telFields = this.telFields;
    if (telFields.length === 0) {
      return {ok: false, error: new VCardMakeError('Invalid phones')};
    }

    const vCardValues = [this.infoField, `FN:${this.fullName}`].concat(
      telFields
    );
    if (this.nickname) {
      vCardValues.push(
        `NICKNAME:${this.nickname}`.substring(0, VCard.MAXIMUM_CHARACTERS)
      );
    }

    return {
      ok: true,
      value: this.wrapVCardValues(vCardValues).join('\n'),
    };
  }

  get fullName() {
    let name = this.firstName;
    if (this.lastName) {
      name += ` ${this.lastName}`;
    }

    return name.substring(0, VCard.MAXIMUM_CHARACTERS);
  }

  private get telFields() {
    return compactMap(this.phones, phone => {
      const number = phone.number.trim();
      if (number.length === 0) {
        return null;
      }

      const type = phone.type.trim();
      if (type.length === 0) {
        return null;
      }

      const telField = `TEL;type=CELL;type=${type};type=pref:${number}`;
      if (telField.length + 2 >= VCard.MAXIMUM_CHARACTERS) {
        return null;
      }

      return telField;
    });
  }

  private get infoField() {
    let info = '';
    if (this.lastName) {
      info = this.lastName.split(' ').join(',');
    }

    info += `${info.length > 0 ? ';' : ''}${this.firstName
      .split(' ')
      .join(',')}`;

    return `N:${info.split(' ').join(';')}`.substring(
      0,
      VCard.MAXIMUM_CHARACTERS
    );
  }

  private wrapVCardValues(values: string[]) {
    return ['BEGIN:VCARD', `VERSION:${VCard.VERSION}`].concat([
      ...values,
      'END:VCARD',
    ]);
  }

  // Should fit in to 8bits
  private static MAXIMUM_CHARACTERS = 2 ** 8;
  private static VERSION = '3.0';
}

class VCardMakeError extends Error {
  constructor(reason: string) {
    super(`failed to make VCard; ${reason}`);
  }
}

export default VCard;
