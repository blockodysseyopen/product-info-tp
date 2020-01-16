/**
 * Copyright 2019 BlockOdyssey Corporation
 * ------------------------------------------------------------------------------
 */

'use strict'

const { sdkPath } = require('./config');
const { TransactionProcessor } = require(`${sdkPath}/processor`);
const ProductInfoHandler = require('./handler')

const address = 'tcp://localhost:4004'

const transactionProcessor = new TransactionProcessor(address)

transactionProcessor.addHandler(new ProductInfoHandler())

transactionProcessor.start()