var _ = require('lodash'),
    util = require('./util.js'),
    google = require('googleapis'),
    service = google.drive('v3');

var pickInputs = {
        'ignoreDefaultVisibility': { key: 'ignoreDefaultVisibility', type: 'boolean' },
        'keepRevisionForever': { key: 'keepRevisionForever', type: 'boolean' },
        'ocrLanguage': 'ocrLanguage',
        'useContentAsIndexableText': { key: 'useContentAsIndexableText', type: 'boolean' }
    },
    pickOutputs = {
        'id': 'id',
        'name': 'name',
        'description': 'description',
        'parents': 'parents',
        'createdTime': 'createdTime',
        'owners': { keyName: 'owners', fields: ['emailAddress'] },
        'size': 'size',
        'indexableText': 'contentHints.indexableText'
    };

var fieldsFromApi = 'appProperties,capabilities,contentHints,createdTime,description,explicitlyTrashed,fileExtension,folderColorRgb,fullFileExtension,headRevisionId,iconLink,id,imageMediaMetadata,kind,lastModifyingUser,md5Checksum,mimeType,modifiedByMeTime,modifiedTime,name,originalFilename,ownedByMe,owners,parents,permissions,properties,quotaBytesUsed,shared,sharedWithMeTime,sharingUser,size,spaces,starred,thumbnailLink,trashed,version,videoMediaMetadata,viewedByMe,viewedByMeTime,viewersCanCopyContent,webContentLink,webViewLink,writersCanShare';

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var OAuth2 = google.auth.OAuth2,
            oauth2Client = new OAuth2(),
            credentials = dexter.provider('google').credentials();
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (validateErrors)
            return this.fail(validateErrors);

        // set credential
        oauth2Client.setCredentials({
            access_token: _.get(credentials, 'access_token')
        });
        google.options({ auth: oauth2Client });

        inputs.fields = fieldsFromApi;
        service.files.create(inputs, function (error, data) {
            if (error)
                this.fail(error);
             else
                this.complete(util.pickOutputs(data, pickOutputs));
        }.bind(this));
    }
};
