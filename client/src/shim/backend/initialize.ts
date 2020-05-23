import Parse from 'parse';
import applicationId from '../../../../parse/config/applicationId.json';
import javaScriptKey from '../../../../parse/config/javaScriptKey.json';
import serverUrl from '../../../../parse/config/serverUrl.json';

function initialize() {
  Parse.initialize(applicationId, javaScriptKey);
  Parse.serverURL = serverUrl;
}

export default initialize;
