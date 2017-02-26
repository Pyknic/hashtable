# hashtable.js
JavaScript library for storing and retrieving complex objects in localStorage or sessionStorage.

## Usage ##
In the following examples, this class is used to represent a complex object that we want to store.
```javascript
class Person {
    constructor(id, firstname, lastname) {
        this.id        = id;
        this.firstname = firstname;
        this.lastname  = lastname;
    }
}
```

HashTables can be backed by either the `localStorage` or `sessionStorage` depending on which implementation is used.
```javascript
var localTable   = new LocalHashTable('my_table', person => person.id);
var sessionTable = new SessionHashTable('my_table', person => person.id);
```

The `namespace` string is later used to find the `HashTable` after the browser is refreshed and the lambda expression determines how the uniquely identify a value. The identifier must return a `number`.

### Writing to a HashTable ###
```javascript
// Write values individually
table.put(new Person(1, "Adam", "Adamsson"));
table.put(new Person(2, "Bert", "Bertsson"));
table.put(new Person(3, "Carl", "Carlsson"));

// Write many values at once
table.putAll([
     new Person(4, "Dave", "Davesson"),
     new Person(5, "Eric", "Ericsson"),
     new Person(6, "Fred", "Fredsson")
]);

// Overwrite an existing value
table.put(new Person(1, "Adam2", "Adamsson2"));
```
### Reading Objects ###
```javascript
// Get individual values
var adam = table.get(1);
var bert = table.put(2);
var carl = table.put(3);
 
// Get array of keys
var keys = table.keys();

// Get many values
var people = table.values();
```

### Deleting Objects ###
```javascript
// Delete 'Bert' from the table
table.delete(2);
```

## License
Copyright 2017 Emil Forslund

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
