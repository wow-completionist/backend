const endpoints = {
    GET_ROOT: '/',

    POST_LOGIN: '/login',
    POST_SIGNUP: '/signup',

    GET_ITEM_LIST: '/items',
    POST_ITEM: '/item',
    POST_ITEM_UPDATE: '/item/:sourceID',
    POST_FETCH_ITEM_NAME: '/item/fetchName/:sourceID',
    POST_DUMP: '/dump',

    GET_USER_LIST: '/users',
    GET_USER_BY_ID: '/user/:userId',
    POST_USER: '/user',
    POST_COLLECTED: '/collected',

    GET_SET_LIST: '/sets',
    POST_SET: '/set',
    POST_SET_UPDATE: '/set/:setId',
    DELETE_VISUAL_FROM_SET: '/set/:setId/visual/:visualID',

    GET_VISUAL_META: '/visuals',
    POST_VISUAL_META: '/visuals/:visualID'
}

module.exports = endpoints;
