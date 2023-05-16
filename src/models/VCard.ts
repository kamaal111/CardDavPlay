import compactMap from '../utils/array/compactMap';

import type {Result} from '../types';

interface VCardParams {
  firstName: string;
  lastName?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: Date;
  productID?: string;
}

class VCard {
  firstName: string;
  lastName?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: Date;
  productID?: string;

  constructor(params: VCardParams) {
    this.firstName = params.firstName.trim();
    this.lastName = params.lastName?.trim();
    this.phones = params.phones;
    this.nickname = params.nickname?.trim();
    this.birthday = params.birthday;
  }

  makeContent(): Result<string, VCardMakeError> {
    const vCardValues = [
      `PRODID:${this.productID ?? '-//Kamaal.io'}`.substring(
        0,
        VCard.MAXIMUM_CHARACTERS
      ),
      this.infoField,
      this.fullNameField,
      ...this.telFields,
    ];

    if (this.nickname) {
      vCardValues.push(
        `NICKNAME:${this.nickname}`.substring(0, VCard.MAXIMUM_CHARACTERS)
      );
    }

    const birthdayField = this.birthdayField;
    if (birthdayField) {
      vCardValues.push(birthdayField);
    }

    return {
      ok: true,
      value: this.wrapVCardValues(vCardValues).join('\n'),
    };
  }

  private get fullNameField() {
    let name = this.firstName;
    if (this.lastName) {
      name += ` ${this.lastName}`;
    }

    return `FN:${name}`.substring(0, VCard.MAXIMUM_CHARACTERS);
  }

  private get birthdayField() {
    if (!this.birthday) {
      return null;
    }

    const year = this.birthday.getUTCFullYear();
    const month = (this.birthday.getMonth() + 1).toString().padStart(2, '0');
    const day = this.birthday.getDate().toString().padStart(2, '0');
    return `BDAY:${year}-${month}-${day}`;
  }

  private get telFields(): string[] {
    return compactMap(this.phones, phone => {
      const number = phone.number.trim();
      if (number.length === 0) {
        return null;
      }

      const typeFields = phone.types
        .map(type => `type=${type.trim()}`)
        .join(';');

      const telField = `TEL;${typeFields}:${number}`;
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

    return `N:${info.split(' ').join(';')};;;`.substring(
      0,
      VCard.MAXIMUM_CHARACTERS
    );
  }

  private wrapVCardValues(values: string[]): string[] {
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
