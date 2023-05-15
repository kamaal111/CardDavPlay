import type {Response} from 'express';

import VCard from '../models/VCard';

import type {AppRequest, Result} from '../types';

type CreateVCardPayload = {
  first_name: string;
  last_name?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: string;
};

class ContactsController {
  constructor() {}

  createVCard = (
    request: AppRequest<undefined, undefined, CreateVCardPayload>,
    response: Response
  ) => {
    const validateResult = this.validateVCardPayload(request.body);
    if (!validateResult.ok) {
      response.status(400).json({
        details: validateResult.error.message,
      });
      return;
    }

    const processResult = this.processVCardPayload(request.body);
    if (!processResult.ok) {
      response.status(400).json({
        details: processResult.error.message,
      });
      return;
    }

    const vCard = new VCard(processResult.value);
    const vCardMakeResult = vCard.makeContent();
    if (!vCardMakeResult.ok) {
      response.status(400).json({
        details: vCardMakeResult.error.message,
      });
      return;
    }

    response.status(201).json(vCardMakeResult.value);
  };

  private processVCardPayload = (
    body: CreateVCardPayload
  ): Result<ConstructorParameters<typeof VCard>[0], VCardValidationError> => {
    const {birthday, first_name, last_name, ...restOfBody} = body;

    let formattedBirth: Date | undefined = undefined;
    if (birthday) {
      try {
        formattedBirth = new Date(birthday);
      } catch (error) {
        return {ok: false, error: new VCardValidationError('Wrong birthday')};
      }
    }

    return {
      ok: true,
      value: {
        ...restOfBody,
        birthday: formattedBirth,
        firstName: first_name,
        lastName: last_name,
      },
    };
  };

  private validateVCardPayload = (
    body: CreateVCardPayload
  ): Result<undefined, VCardValidationError> => {
    if (typeof body !== 'object' || Array.isArray(body)) {
      return {ok: false, error: new VCardValidationError('Wrong structure')};
    }

    const {first_name, last_name, phones, nickname, birthday} = body;
    if (!this.firstNameIsValid(first_name)) {
      return {ok: false, error: new VCardValidationError('Wrong first_name')};
    }
    if (!this.phonesIsValid(phones)) {
      return {ok: false, error: new VCardValidationError('Wrong phones')};
    }
    if (!this.lastNameIsValid(last_name)) {
      return {ok: false, error: new VCardValidationError('Wrong last_name')};
    }
    if (!this.nicknameIsValid(nickname)) {
      return {ok: false, error: new VCardValidationError('Wrong nickname')};
    }
    if (!this.birthdayIsValid(birthday)) {
      return {ok: false, error: new VCardValidationError('Wrong birthday')};
    }

    return {ok: true, value: undefined};
  };

  private phonesIsValid(phones: {types: string[]; number: string}[]) {
    return (
      Array.isArray(phones) &&
      phones.every(
        phone =>
          typeof phone.number === 'string' &&
          Array.isArray(phone.types) &&
          phone.types.every(type => typeof type === 'string')
      )
    );
  }

  private birthdayIsValid(birthday?: string) {
    return typeof birthday === 'string' || birthday == null;
  }

  private lastNameIsValid(lastName?: string) {
    return typeof lastName === 'string' || lastName == null;
  }

  private firstNameIsValid(firstName: string) {
    return typeof firstName === 'string';
  }

  private nicknameIsValid(nickname?: string) {
    return typeof nickname === 'string' || nickname == null;
  }
}

class VCardValidationError extends Error {
  constructor(field: string) {
    super(`Invalid VCard payload; ${field}`);
  }
}

export default ContactsController;
