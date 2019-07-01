# Querying in Memory Data Using Lodash

Generally, we make calls to the server side APIs, get some data back and then DO STUFF with that data.

Most of the DO STUFF involves filtering the data based on some parameters, and then drawing colored red / green colored boxes, or keeping track of what someone clicked on, or making sure if a replicate is selected is interesting its interesting in all views.

Since the data is in memory we don't use asynchronous calls, so no Promises or Observables.

There are several libraries that are really great for parsing large data structures, but the one used on both the client side and server side is called [Lodash](https://lodash.com/docs/4.17.11).

Before we go over that we will go over some of the more basic ways of iterating over arrays, declaring objects, etc.

The lodash library is very comprehensive and I suggest looking at the docs for the most up to date information.

# Iterate over an array in javascript

## Data - ExpAssayResultSet

```
//Obviously there is more data than this in an ExpAssay table. This is for demonstration purposes
let data = [{assayId: 1}, {assayId: 2}, {assayId: 3}];
```

## Loop over the data

```
data.map((expAssay, index) => {
//First this would be {assayId: 1}
// Second it would be {assayId: 2}
// And so on...
});
```

# Objects in Javascript

## Declaring properties

```
let myObject = {};

// Set property using a string
myObject['assayId'] = 1;
myObject.assayId = 1;

// Set property using a keyname that is stored in a variable
let key  = 'assayId';
myObject[key] = 1;
// myObject.key would work, but the key would be set to 'key', not assayId
```

## Recursively declaring properties

Javascript is not like, say perl, where you can just add keys in and go nuts.

For instance:

```
let myObject = {};
myObject['key1']['key2'] = 3;
```

Would throw an error.

This would work:
```
let myObject = {};
myObject['key1'] = {};
myObject['key1']['key2'] = 3;
```

Or you could do it in one step using the lodash `set` library.

```
import {set} from 'lodash';
let myObject = {};
set(myObject, ['key1', 'key2'], 3);
```

## Get values from an object

Please take note of the different ways to access properties in an object! 

```
let v = myObject['key1'];
let v = myObject.key1;
let key = 'key1';
let v = myObject[key1];
// v = 3
```

Using Lodash:

```
import {get} from 'lodash';
let v = get(myObject, ['key1']);
// v = 3
```

## Check if a path exists in an object

Use lodash `has` to return a True/False value to see if the path exists. This is different from `get` in that `get` returns the value itself, where as `has` simply tells you if the value exists. It is better to use `has` to ensure you are differentiating between a value not existing or being `0`, `null`, `False`, etc.

```
import {has} from 'lodash';

if(has(myObject, ['key1']) {
    console.log('key1 exists');
} else {
    console.log('key 1 does not exist!');
}
```

## Loop over the data and return a new array of JUST the assayIds

```
// Having the index is optional
let assayIds = data.map((expAssay) => {
return expAssay.assayId;
});
// assayIds -> [1,2,3]
```

# Querying Data

## Filter the data to get all objects where the AssayId = 1

Filtering returns ALL results (so an array of results) where the inner functions returns true. In this case we are looking for objects that equal {assayId: 3}.

You can actually do this in two different ways. You can use the regular javascript .filter property that exists on all arrays, or you can use lodash, which gives you a bit more power and flexibility.

Lodash is generally the safer way to do it, because weird things happen with scalar types as being numbers/strings in server side code.

```
import {isEqual, filter} from 'lodash';

// Option 1 - Build in javascript
// In order to avoid types being stupid, either force both to a number or string.
let assayIds3 = data.filter((expAssay) => {
return isEqual(Number(expAssay.assayId), 3); 
});

// Option 2 - Lodash
let assayIds3 = filter(data, (expAssay) => {
return isEqual(Number(expAssay.assayId), 3); 
});

// Option 2 - Lodash for those that like to live dangerously
// And not do any type checking
let assayIds3 = filter(data, {assayId: 3});

// assayIds3 = [{assayId: 3}]
```

## Find a single instance of matching data

For instance, if a single replicate is marked as interesting, then I don't care what the rest are because the whole set is interesting.

Find a single instance where the {assayId: 3}
```
import {isEqual, find} from 'lodash';
// Option 2 - Lodash
let expAssay = find(data, (expAssay) => {
return isEqual(Number(expAssay.assayId), 3); 
});

// Option 2 - Lodash for those that like to live dangerously
// And not do any type checking
let expAssay = find(data, {assayId: 3});

//expAssay: {assayId: 3}
```

# TypeChecking

Occasionally things go side ways and we want to ensure a value is an array, or an object, isNull, or isUndefined

(Keep in mind in javascript that there are separate build in values for null and undefined).

The following functions return True/False

```
import {isObject, isArray, isNull, isUndefined} from 'lodash';

isNull(null);
// => true
isNull(void 0);
// => false

isUndefined(void 0);
// => true
isUndefined(null);
// => false

isObject({});
// => true
isObject([1, 2, 3]);
// => true

isArray([1, 2, 3]);
// => true
isArray('abc');
// => false
```

You get the idea. Check out the lodash docs for more examples. Other type checks include isNumber, isString.

# Example - Get all expGroupIds that have been toggled as interesting

Let's say we have a data structure that is an array of objects, where each object has an assayId, an expGroupId, a treatmentGroupId, an interesting (0/1) property and an imagePath, which we loop through to give the contact sheet view. (Which is basically what we have in the contact sheet view.)

```
let data = [
{
    assayId: 1,
    treatmentGroupId: 1,
    expGroupId: 1,
    imagePath: '',
    interesting: 0
},
{
    assayId: 2,
    treatmentGroupId: 1,
    expGroupId: 1,
    imagePath: '',
    interesting: 1
},
{
    assayId: 2,
    treatmentGroupId: 1,
    expGroupId: 1,
    imagePath: '',
    interesting: 0
},
];
```

## Step 1 - Get all objects that have interesting: 1

```
import {isEqual, filter, uniq} from 'lodash';

let interestingAssay = filter(data, (expAssay) => {
    return isEqual(Number(expAssay.interesting), 1);
});

// Outcome
// interestingAssay = [{
//      assayId: 2,
//      treatmentGroupId: 1,
//      expGroupId: 1,
//      imagePath: '',
//      interesting: 1
//  }];
//
```

## Step 2 - Get a list of just treatment group Ids

```
let treatmentGroupIds = interestingAssays.map((expAssay) => {
    return treatmentGroupId;
});
// Outcome
// treatmentGroupIds = [1];
```

## Step 3 - Update all replicates to have interesting: 1 where any replicate is interesting

Let's say we want to take that same data object, but anywhere we see a treatmentGroupId of 1 update it to be interesting.

```
import {set, isEqual} from 'lodash';

data.map((expAssay) => {
    if(isEqual(Number(expAssay.treatmentGroupId), 1)) {
        set(expAssay, ['interesting'], 1);
    }
});
```

