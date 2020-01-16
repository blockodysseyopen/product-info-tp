/**
 * Copyright 2019 BlockOdyssey Corporation
 * ------------------------------------------------------------------------------
 */

'use strict'

const { sdkPath } = require('./config');
const ProductInfoPayload = require('./payload');
const { PRODUCT_INFO_FAMILY, PRODUCT_INFO_VERSION, PRODUCT_INFO_NAMESPACE, ProductInfoState } = require('./state');

const { TransactionHandler } = require(`${sdkPath}/processor/handler`);
const { InternalError } = require(`${sdkPath}/processor/exceptions`);

class ProductInfoHandler extends TransactionHandler {
    constructor() {
        super(PRODUCT_INFO_FAMILY, [PRODUCT_INFO_VERSION], [PRODUCT_INFO_NAMESPACE]);
    }

    apply(transactionProcessRequest, context) {
        let payload = ProductInfoPayload.fromBytes(transactionProcessRequest.payload);
        let productInfoState = new ProductInfoState(context);

        return productInfoState.actionFn(payload).then((resAddresses) => {
            if (resAddresses.length === 0) {
                throw new InternalError('State Error!');
            }
        });
    }
}

module.exports = ProductInfoHandler;