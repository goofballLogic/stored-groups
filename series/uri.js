module.exports = {

    isAbsoluteUri( maybeAbsoluteUri ) {

        return /^https?:\/\//.test( maybeAbsoluteUri );

    },

    pathOf( href ) {

        return ( new URL( href, "http://openteamspace.com" ) ).pathname;

    }

}