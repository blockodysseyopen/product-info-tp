/**
 * Copyright 2019 BlockOdyssey Corporation
 * ------------------------------------------------------------------------------
 */

'use strict'
const { sdkPath } = require('./config');
const { InvalidTransaction } = require(`${sdkPath}/processor/exceptions`);

const MAX_CODE_LENGTH = 20;
const MAX_NAME_LENGTH = 40;

class ProductInfoPayload {
    constructor (payload) {
        this.nameForAddress = payload.nameForAddress;
        this.productCode = payload.productCode;
        this.creatorCode = payload.creatorCode;
        this.action = payload.action;
        this.productDetail = payload.productDetail;
        this.timeStamp = payload.timeStamp;
    }

    static fromBytes(payload) {
        payload = JSON.parse(payload.toString());

        if (Object.keys(payload).length === 6) {
            if (!payload.nameForAddress) {
                throw new InvalidTransaction('"nameForAddress" is required');
            } else if (payload.nameForAddress.length > MAX_NAME_LENGTH) {
                throw new InvalidTransaction(`"nameForLength" is too long: max length is ${MAX_NAME_LENGTH}`);
            }
            if (!payload.productCode) {
                throw new InvalidTransaction('"productCode" is required');
            } else if (payload.productCode.length > MAX_CODE_LENGTH) {
                throw new InvalidTransaction(`"productCode" is too long: max length is ${MAX_CODE_LENGTH}`);
            }
            if (!payload.creatorCode) {
                throw new InvalidTransaction('"creatorCode" is required');
            } else if (payload.productCode.length > MAX_CODE_LENGTH) {
                throw new InvalidTransaction(`"creatorCode" is too long: max length is ${MAX_CODE_LENGTH}`);
            }
            if (!payload.action) {
                throw new InvalidTransaction('"action" is required');
            }
            if (!payload.productDetail) {
                throw new InvalidTransaction('"productDetail" is required');
            }
            if (!payload.timeStamp) {
                throw new InvalidTransaction('"timeStamp" is required');
            }

            let productInfoPayload = new ProductInfoPayload(payload);
            
            return productInfoPayload;
        } else {
            throw new InvalidTransaction('Invalid payload serialization');
        }
    }
}

module.exports = ProductInfoPayload;