const Group = require( "./Group" );
const dateid = require( "./dateid" );

module.exports = storage => {

    const { buckets, bucket } = storage;

    async function listGroups() {

        const groupBuckets = await buckets();
        return Promise.all( groupBuckets.map( Group.load ) );

    }

    async function createGroup( options ) {

        let { id, name } = options;
        if ( !name ) throw new Error( "No name specified" );
        id = id || dateid();
        const groupBucket = await bucket( id );
        const creating = new Group( groupBucket, options );
        await creating.saveCommand.invoke();
        return await Group.load( groupBucket );

    }

    return {

        listGroups,
        createGroup

    };

};
