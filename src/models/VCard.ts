import compactMap from '../utils/array/compactMap';
import uuid from '../utils/uuid';

interface VCardable {
  firstName: string;
  lastName?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: Date;
  productID?: string;
  uid?: string;
  addresses?: {
    types: string[];
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }[];
}

class VCard implements VCardable {
  firstName: string;
  lastName?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: Date;
  productID?: string;
  uid: string;
  addresses?: {
    types: string[];
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }[];

  private _rawContent: string;

  constructor(params: VCardable) {
    this.firstName = params.firstName.trim();
    this.lastName = params.lastName?.trim();
    this.phones = params.phones;
    this.nickname = params.nickname?.trim();
    this.birthday = params.birthday;
    this.addresses = params.addresses;
    this.uid = this.makeID(params.uid?.trim());
    this._rawContent = this.makeContent();
  }

  get content(): string {
    return this._rawContent;
  }

  private get idField() {
    return `UID:${this.uid}`;
  }

  private get addressFields(): string[] {
    return compactMap(this.addresses ?? [], address => {
      const addressFields: (keyof typeof address)[] = [
        'street',
        'postalCode',
        'city',
        'country',
      ];
      if (addressFields.every(field => !address[field])) {
        return null;
      }

      const types = address.types.map(type => `type=${type}`).join(';');
      const combinedAddress = addressFields
        .map(field => (address[field] as string).trim())
        .join(';');

      const addressField = `ADR;${types}:;;${combinedAddress}`;
      if (addressField.length + 2 >= VCard.MAXIMUM_CHARACTERS) {
        return null;
      }

      return addressField;
    });
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

  private makeContent(): string {
    const vCardValues = [
      `PRODID:${this.productID ?? '-//Kamaal.io'}`.substring(
        0,
        VCard.MAXIMUM_CHARACTERS
      ),
      this.idField,
      this.infoField,
      this.fullNameField,
      ...this.telFields,
      ...this.addressFields,
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

    return this.wrapVCardValues(vCardValues).join('\n');
  }

  private makeID(id?: string): string {
    return id ?? uuid();
  }

  private wrapVCardValues(values: string[]): string[] {
    return ['BEGIN:VCARD', `VERSION:${VCard.VERSION}`].concat([
      ...values,
      'END:VCARD',
    ]);
  }

  // Fields should fit in to 8bits
  private static MAXIMUM_CHARACTERS = 2 ** 8;
  private static VERSION = '3.0';
}

export default VCard;
