'use strict';

var util = require('util');
var async = require('async');
var msRestAzure = require('ms-rest-azure');
var ComputeManagementClient = require('azure-arm-compute');
var ResourceManagementClient = require('azure-arm-resource').ResourceManagementClient;

_validateEnvironmentVariables();
var clientId = process.env['CLIENT_ID'];
var domain = process.env['DOMAIN'];
var secret = process.env['APPLICATION_SECRET'];
var subscriptionId = process.env['AZURE_SUBSCRIPTION_ID'];
var resourceClient, computeClient;

///////////////////////////////////////////
//     Entrypoint for sample script      //
///////////////////////////////////////////

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    msRestAzure.loginWithServicePrincipalSecret(clientId, secret, domain, function (err, credentials, subscriptions) {
        if (err) return console.log(err);
        resourceClient = new ResourceManagementClient(credentials, subscriptionId);
        computeClient = new ComputeManagementClient(credentials, subscriptionId);

        async.series([
            function (callback) {
                console.log('\n>>>>>>>Start of Task5: List all vms under the current subscription.');
                computeClient.virtualMachines.listAll(function (err, result) {
                    if (err) {
                        console.log(util.format('\n???????Error in Task5: while listing all the vms under ' +
                                                'the current subscription:\n%s', util.inspect(err, { depth: null })));
                        callback(err);
                    } else {
                        console.log(util.format('\n######End of Task5: List all the vms under the current ' +
                                                'subscription is successful.\n%s', util.inspect(result, { depth: null })));
                        callback(null, result);
                    }
            });
        }],
            //final callback to be run after all the tasks
            function (err, results) {
                if (err) {
                    console.log(util.format('\n??????Error occurred in one of the operations.\n%s', 
                                            util.inspect(err, { depth: null })));
                } else {
                    console.log(util.format('\n######All the operations have completed successfully. ' + 
                                            'The final set of results are as follows:\n%s', util.inspect(results, { depth: null })));
                    console.log(results);
                    context.res = results;
                    context.done();
                }
                return;
            });
    });
};


function _validateEnvironmentVariables() {
  var envs = [];
  if (!process.env['CLIENT_ID']) envs.push('CLIENT_ID');
  if (!process.env['DOMAIN']) envs.push('DOMAIN');
  if (!process.env['APPLICATION_SECRET']) envs.push('APPLICATION_SECRET');
  if (!process.env['AZURE_SUBSCRIPTION_ID']) envs.push('AZURE_SUBSCRIPTION_ID');
  if (envs.length > 0) {
    throw new Error(util.format('please set/export the following environment variables: %s', envs.toString()));
  }
}