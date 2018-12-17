const { items, buckets } = require( "./storage" );

async function run() {

    const teams = await buckets();
    console.log( teams.map( team => team.name ) );

}
run();

