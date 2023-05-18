import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import type {NextFunction, Response} from 'express';

import VCardModel from '../models/VCard';
import VCardDatabaseModel from '../models/database/VCard';
import isOptionalValueType from '../utils/isOptionalValueType';
import sendError from '../utils/requests/sendError';

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

  findVCard = async (
    request: AppRequest<{id: string}>,
    response: Response,
    next: NextFunction
  ) => {
    const {id} = request.params;

    const vCard = await VCardDatabaseModel.findOne({uid: id});
    if (vCard == null) {
      sendError(response, next)(404);
      return;
    }

    const filepath = `data/contacts/${id}.vcf`;
    if (!fs.existsSync(filepath)) {
      await fsPromises.writeFile(filepath, vCard.content!);
    }

    const file = await fsPromises.readFile(filepath);

    response.writeHead(200, {'Content-Type': 'text/x-vcard'}).end(file);
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

class VCardValidationError extends Error {
  constructor(field: string) {
    super(`Invalid VCard payload; ${field}`);
  }
}

export default ContactsController;
