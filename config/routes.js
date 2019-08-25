const endpoints = {
    GET_ROOT: '/',

    POST_LOGIN: '/login',
    GET_CALLBACK: '/callback',
    GET_USER_CHARACTERS: '/userCharacters',

    GET_SOURCE_LIST: '/sources',
    POST_FETCH_SOURCE_NAME: '/source/fetchName/:sourceID',
    POST_IMPORT: '/import',

    GET_USER_LIST: '/users',
    GET_USER_BY_ID: '/user/:userId',
    POST_USER: '/user',
    POST_COLLECTED: '/collected/:userId',

    GET_SET_LIST: '/sets',
    POST_SET: '/set',
    POST_SET_UPDATE: '/set/:setId',
    DELETE_VISUAL_FROM_SET: '/set/:setId/slot/:slot/visual/:visualID',

    GET_VISUAL_META: '/visuals',
    POST_VISUAL_META: '/visuals/:visualID'
}

module.exports = endpoints;
