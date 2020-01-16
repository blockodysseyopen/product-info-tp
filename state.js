/**
 * Copyright 2019 BlockOdyssey Corporation
 * ------------------------------------------------------------------------------
 */

'use strict'
const { sdkPath } = require('./config');
const { InvalidTransaction, InternalError } = require(`${sdkPath}/processor/exceptions`);

const crypto = require('crypto');

const _hash = (x) => {
    return crypto.createHash('sha512').update(x).digest('hex').toLowerCase();
};

const PRODUCT_INFO_FAMILY = 'product-info';
const PRODUCT_INFO_VERSION = '1.0';
const PRODUCT_INFO_NAMESPACE = _hash(PRODUCT_INFO_FAMILY).substring(0, 6);

const _makeProductInfoAddress = (productCode, creatorCode, nameForAddress) => {
    let prevAddress = `${creatorCode}-${productCode}`;

    if (prevAddress !== nameForAddress) {
        throw new InvalidTransaction(`"nameForAddress" is wrong: ${nameForAddress}`);
    }
    let postfix = _hash(prevAddress).slice(-64);
    return PRODUCT_INFO_NAMESPACE + postfix;
};

class ProductInfoState {
    constructor(context) {
        this.context = context;
        this.timeout = 500;
    }

    async actionFn(payload) {
        if (payload.action === 'create') {
            return await this.createProductInfo(payload);
        } else if (payload.action === 'modify') {
            return await this.modifyProductInfo(payload);
        } else {
            throw new InvalidTransaction(`"action" must be "create", "modify" not ${payload.action}`);
        }
    }

    async createProductInfo(payload) {
        try {
            let address = _makeProductInfoAddress(payload.productCode, payload.creatorCode, payload.nameForAddress);

            let stateValue = await this._getProduct(address);
            if (stateValue !== null) {
                throw new InvalidTransaction(`Action is "create" but Product already in state, productCode: ${stateValue.productCode}, creatorCode: ${stateValue.creatorCode}`);
            } else {
                stateValue = {
                    productCode: payload.productCode,
                    creatorCode: payload.creatorCode,
                    productDetail: payload.productDetail,
                    creationDate: payload.timeStamp,
                    historyOfChange: [
                        {
                            date: payload.timeStamp,
                            action: 'create'
                        }
                    ]
                };
                return await this._setEntry(address, stateValue);
            }
        } catch (err) {
            throw err;
        }
    }

    async modifyProductInfo(payload) {
        try {
            let address = _makeProductInfoAddress(payload.productCode, payload.creatorCode, payload.nameForAddress);

            let stateValue = await this._getProduct(address);
            if (stateValue === null) {
                throw new InvalidTransaction(`Action is "modify" but there is no Product in state, productCode: ${payload.productCode}, creatorCode: ${payload.creatorCode}`);
            } else {    
                if (stateValue.productDetail && stateValue.historyOfChange) {    
                    stateValue.productDetail = payload.productDetail;
                    stateValue.historyOfChange.push({ date: payload.timeStamp, action: 'modify' });
                    return await this._setEntry(address, stateValue);
                } else {
                    throw new InvalidTransaction(`TP Error, probably because the property name has been changed`);
                    // InternalError 로 처리하면 무한 루프에 돌입하기 때문에 process를 끝내는 목적으로는 항상 InvalidTransaction을 throw 해야 함.
                }
            }
        } catch (err) {
            throw err;
        }
    }

    async _getProduct(address) {
        try{
            let possibleAddressValues = await this.context.getState([address], this.timeout);
            let stateValueRep = possibleAddressValues[address];
            let stateValue;
            if (stateValueRep && stateValueRep.length > 0) {
                stateValue = JSON.parse(stateValueRep.toString());
                return stateValue;
            } else {
                return null;
            }
        } catch (err) {
            throw err;
        }
    }

    async _setEntry(address, stateValue) {
        let entries = {
            [address]: Buffer.from(JSON.stringify(stateValue))
        }
        return await this.context.setState(entries);
    }
}

module.exports = {
    PRODUCT_INFO_FAMILY,
    PRODUCT_INFO_VERSION,
    PRODUCT_INFO_NAMESPACE,
    ProductInfoState
};