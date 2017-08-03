import * as request from 'request-promise-native';

export let boosterJSON = async (setName: String): Promise<object[]> => {
    try {
        return await request({uri: 'https://api.magicthegathering.io/v1/sets/' + setName + '/booster', json: true});
    }
    catch(error) {
        return Promise.reject(error)
    }
}