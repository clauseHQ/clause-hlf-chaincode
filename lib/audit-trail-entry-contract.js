/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class AuditTrailEntryContract extends Contract {
    async storeAuditEvent(ctx, contractId, eventText) {
        const buffer = Buffer.from(JSON.stringify(eventText));
        await ctx.stub.putState(`${contractId}-AuditEvent`, buffer);
    }
}

module.exports = AuditTrailEntryContract;
