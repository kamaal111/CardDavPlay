import type {Response} from 'express';

import VCardModel from '../models/VCard';
import VCardDatabaseModel from '../models/database/VCard';
import isOptionalValueType from '../utils/isOptionalValueType';

import type {AppRequest, Result} from '../types';

type CreateVCardPayload = {
  first_name: string;
  last_name?: string;
  phones: {types: string[]; number: string}[];
  nickname?: string;
  birthday?: string;
  product_id?: string;
  addresses?: {
    types: string[];
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
  }[];
};

class ContactsController {
  constructor() {}

  findVCard = async (request: AppRequest<{id: string}>, response: Response) => {
    const vCardResult = await this.findVCardByID(request.params.id);
    if (!vCardResult.ok) {
      response.status(404).json({
        details: vCardResult.error.message,
      });
      return;
    }

    const content = Buffer.from(vCardResult.value.content, 'utf-8');
    response.writeHead(200, {'Content-Type': 'text/x-vcard'}).end(content);
  };

  updateVCard = async (
    request: AppRequest<{id: string}, undefined, CreateVCardPayload>,
    response: Response
  ) => {
    const vCardResult = await this.findVCardByID(request.params.id);
    if (!vCardResult.ok) {
      response.status(404).json({
        details: vCardResult.error.message,
      });
      return;
    }

    response.status(204).send();
  };

  createVCard = async (
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

    const vCard = new VCardModel(processResult.value);
    const vCardDatabaseModel = new VCardDatabaseModel({
      uid: vCard.uid,
      content: vCard.content,
    });
    await vCardDatabaseModel.save();

    response
      .status(201)
      .json({details: 'Success', contact_id: vCardDatabaseModel.uid});
  };

  private findVCardByID = async (
    id: string
  ): Promise<Result<{uid: string; content: string}, VCardFindError>> => {
    const vCard = await VCardDatabaseModel.findOne({uid: id});
    if (vCard == null) {
      return {ok: false, error: new VCardFindError(id)};
    }

    return {ok: true, value: vCard as {uid: string; content: string}};
  };

  private processVCardPayload = (
    body: CreateVCardPayload
  ): Result<
    ConstructorParameters<typeof VCardModel>[0],
    VCardValidationError
  > => {
    const {birthday, first_name, last_name, product_id, ...restOfBody} = body;

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
        productID: product_id,
      },
    };
  };

  private validateVCardPayload = (
    body: CreateVCardPayload
  ): Result<undefined, VCardValidationError> => {
    if (typeof body !== 'object' || Array.isArray(body)) {
      return {ok: false, error: new VCardValidationError('Wrong structure')};
    }

    const fieldsThatAreOptionalStrings: (keyof typeof body)[] = [
      'last_name',
      'nickname',
      'birthday',
      'product_id',
      'product_id',
    ];
    for (const field of fieldsThatAreOptionalStrings) {
      if (!isOptionalValueType(body[field], 'string')) {
        return {ok: false, error: new VCardValidationError(`Wrong ${field}`)};
      }
    }

    const fieldsThatAreStrings: (keyof typeof body)[] = ['first_name'];
    for (const field of fieldsThatAreStrings) {
      if (typeof body[field] !== 'string') {
        return {ok: false, error: new VCardValidationError(`Wrong ${field}`)};
      }
    }

    if (!this.phonesIsValid(body.phones)) {
      return {ok: false, error: new VCardValidationError('Wrong phones')};
    }
    if (!this.addressesIsValid(body.addresses)) {
      return {ok: false, error: new VCardValidationError('Wrong addresses')};
    }

    return {ok: true, value: undefined};
  };

  private phonesIsValid(phones: CreateVCardPayload['phones']) {
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

  private addressesIsValid(addresses: CreateVCardPayload['addresses']) {
    for (const address of addresses ?? []) {
      const typesIsValid =
        typeof address === 'object' &&
        !Array.isArray(address) &&
        Array.isArray(address.types) &&
        address.types.every(type => typeof type === 'string');
      if (!typesIsValid) {
        return false;
      }

      const fieldsThatAreOptionalStrings: (keyof typeof address)[] = [
        'street',
        'postalCode',
        'city',
        'country',
      ];
      for (const field of fieldsThatAreOptionalStrings) {
        if (!isOptionalValueType(address[field], 'string')) {
          return false;
        }
      }
    }

    return true;
  }
}

class VCardFindError extends Error {
  constructor(id: string) {
    super(`Could not find VCard of id=${id}`);
  }
}

class VCardValidationError extends Error {
  constructor(field: string) {
    super(`Invalid VCard payload; ${field}`);
  }
}

export default ContactsController;
