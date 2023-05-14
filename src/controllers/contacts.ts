import type {Response} from 'express';

import VCard from '../models/VCard';

import type {AppRequest, Result} from '../types';

type CreateVCardPayload = {
  first_name: string;
  last_name?: string;
  phones: {type: string; number: string}[];
  nickname?: string;
};

class ContactsController {
  constructor() {}

  createVCard = (
    request: AppRequest<undefined, undefined, CreateVCardPayload>,
    response: Response
  ) => {
    const validateResult = this.validateVCardPayload(request);
    if (!validateResult.ok) {
      response.status(400).json({
        details: validateResult.error.message,
      });
      return;
    }

    const {first_name, last_name, phones, nickname} = validateResult.value;
    const vCard = new VCard({
      firstName: first_name,
      lastName: last_name,
      phones,
      nickname,
    });
    const vCardMakeResult = vCard.make();
    if (!vCardMakeResult.ok) {
      response.status(400).json({
        details: vCardMakeResult.error.message,
      });
      return;
    }

    response.status(201).json(vCardMakeResult.value);
  };

  private validateVCardPayload = (
    request: AppRequest<undefined, undefined, CreateVCardPayload>
  ): Result<CreateVCardPayload, VCardValidationError> => {
    if (typeof request.body !== 'object' || Array.isArray(request.body)) {
      return {ok: false, error: new VCardValidationError('Wrong structure')};
    }

    const {first_name, last_name, phones, nickname} = request.body;
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

    return {ok: true, value: request.body};
  };

  private phonesIsValid(phones: {type: string; number: string}[]) {
    return Array.isArray(phones) && phones.length > 0;
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
