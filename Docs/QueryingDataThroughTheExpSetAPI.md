# ExpSet API

Most of the time data is fetched through the ExpSet API. The exception for this is when we are uploading data, because then the data doesn't exist in the database yet and we are trying to put it there.

Also, in the codebase the query strain + target strain + L4440s + reagent is called an ExpSet, but on the actual interfaces this is generally referred to as a 'Replicate View'.

There are different APIs for querying for ExpSets with some filter for scores: that haven't been scored in the contact sheet, haven't been scored in the contact sheet, passed the contact sheet, have a detailed score, etc.

# ExpSet Filter Object

The ExpSet Filter Object is overly complex and has become kind of a place to just throw stuff in there. It could probably be split into several APIs at this point. Future Work for some enterprising dev!

As a side note as of now the pagination totally doesn't work and its just hanging out there.

In the `chemgen-next-server/common/types/custom/ExpSetTypes/index.ts` there are quite a few custom classes and types to make it easier to treat the database like legos and put them together.

Most ExpSet APIs return a data structure that looks like : `Docs/expSet.json`, which is defined by the `ExpSetSearchResults` class defined in `chemgen-next-server/common/types/custom/ExpSetTypes/index.ts`.

# Example - Search for particular screens

Let's say I want to search for ExpSets with screen Ids 1 or 2. 

```
let expSetSearch  = new ExpSetSearch({});
expSetSearch.screenSearch = [1,2];
```

# A Note on Batches vs Stock Plate Batches vs ExpWorkflows

FYI - Stock Plate Batch is the most recent terminology for the set of plates that were imaged with the same Plate Plan / Stock Plate Layout.

A Stock Plate Batch with the primary screen looks like:

```
RNAiI.3A1 <- Stock plate I-3-A1 in N2
RNAiI.3A1_D <- Stock plate I-3-A1 in N2 duplicate
RNAiI.3A1_M <- Stock plate I-3-A1 in mel-28 (or some other worm strain)
RNAiI.3A1_M_D <- Stock plate I-3-A1 in mel-28 (or some other worm strain) duplicate
L4440_M <- mel-28 + L4440
L4440 <- N2 + L4440
```

These would get grouped together with a single ExpWorkflowId, and a single entry in the ExpWorkflowScreenUpload (yes i know that is a terrible name) MongoDB Collection.

For the contact sheet we need all this, so that the team can see ALL THE THINGS, as they like to do.

Within the codebase the terms get used interchangeably quite a bit.

Each batch/ stock plate batch / expWorkflow is assigned a unique expWorkflowId, that is basically a cheap lookup value. It is used extensively in the codebase to make queries faster, and as a grouping mechanism for the contact sheets and related expSets.

# Example - Get Stock Plate Batches that haven't been scored in the Contact Sheet

Most queries for the front end interface for searching for things scored/ not scored / maybe has an interesting score are here: `chemgen-next-client/src/app/search/search.module.ts`


```
constructor(private expsetApi: ExpSetApi){}

public getData(){
        this.expSetApi
            .getExpWorkflowIdsNotScoredContactSheet()
            .subscribe((results) => {
            // get expSetSearchResults as shown in the expSet.json file
            }, (error) => {
            // something went horrifically wrong good luck
            });
}
```

# Example - Get ExpSets that were marked as Interesting in the contact sheet

```
constructor(private expsetApi: ExpSetApi){}

public getData(){
        this.expSetApi
            .getInterestingExpSets(this.expSetSearch)
            .subscribe((results) => {
            // get expSetSearchResults as shown in the expSet.json file
            }, (error) => {
            // something went horrifically wrong good luck
            });
}
```

If you wanted to get all interesting expSets with a screenId of 1 (mel-28 Primary Enhancer Screen) this same query would be:

```
public expSetSearch: ExpSetSearch;
constructor(private expsetApi: ExpSetApi){}

public getData(){
        this.expSetSearch = new ExpSetSearch();
        this.expSetSearch.screenSearch = [1];
        this.expSetApi
            .getInterestingExpSets(this.expSetSearch)
            .subscribe((results) => {
            // get expSetSearchResults as shown in the expSet.json file
            }, (error) => {
            // something went horrifically wrong good luck
            });
}
```

Most of the ExpSet APIs, except those that have to do specifically with filtering based on reagent IDs, take the ExpSetSearch as a query object.

# Get ExpSets based on Library Data

Most of these queries are already written and have a corresponding REST API here: `chemgen-next-server/common/models/ExpSet/extract/ExpSetExtractQueryByAssay.ts` , but here is an overview.

These queries are a little different because the library tables is where the whole relational database thing breaks down.

Basically what you do is somehow get your reagent_ids, either by searching the RnaiLibrary or Chemical Library tables. Each library has a unique id across tables, so you won't see library id 1 in both the Rnai and Chemical library tables, for instance.

Once you have the library and reagent ids you can query the ExpAssay2reagent table and get any of the IDs there, but for the fastest lookup times get the treatmentGroupIds. Return the treatmentGroupIds to the client side, and then use those in the expSetSearch.

So let's say I query for GENEA, which has library_id 1 and rnai_id 2.

```
SELECT treatment_group_id from exp_assay2reagent where library_id = 1 and rnai_id = 2;
```

This would get you a list of treatmentGroupIds, let's say 4,5,6, which you could then put into the ExpSetApi as

```
public expSetSearch: ExpSetSearch;
constructor(private expsetApi: ExpSetApi){}

public getData(){
        this.expSetSearch = new ExpSetSearch();
        this.expSetSearch.expGroupSearch = [4,5,6];
        
        // Or sets that haven't been scored, or interesting, etc
        this.expSetApi
            .getExpSets(this.expSetSearch)
            .subscribe((results) => {
            // get expSetSearchResults as shown in the expSet.json file
            }, (error) => {
            // something went horrifically wrong good luck
            });
}
```

If you don't need to do any filtering based on scored you can do this in one step using the `ExpSet.extract.getExpSetsByLibraryData` function in `chemgen-next-server/common/models/ExpSet/extract/ExpSetExtractQueryByAssay.ts`.

```
public expSetSearch: ExpSetSearch;
constructor(private expsetApi: ExpSetApi){}

public getData(){
        let reagentSearch = [
            {libraryId: 1, reagentId: 2},
            {libraryId: 1, reagentId: 3}
        ];
        
        // Or sets that haven't been scored, or interesting, etc
        this.expSetApi
            .getExpSetsByLibraryData(reagentSearch)
            .subscribe((results) => {
            // get expSetSearchResults as shown in the expSet.json file
            }, (error) => {
            // something went horrifically wrong good luck
            });
}
```
