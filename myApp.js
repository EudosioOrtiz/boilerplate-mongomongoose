require('dotenv').config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI,{ useNewUrlParser: true, useUnifiedTopology: true })

/*First of all, we need a Schema. Each schema maps to a MongoDB collection. 
It defines the shape of the documents within that collection. 
Schemas are building blocks for Models. They can be nested to create 
complex models, but in this case, we'll keep things simple. 
A model allows you to create instances of your objects, called documents.

Gitpod is a real server, and in real servers, the interactions with 
the database happen in handler functions. These functions are executed 
when some event happens (e.g. someone hits an endpoint on your API). 
We’ll follow the same approach in these exercises. The done() function is 
a callback that tells us that we can proceed after completing an asynchronous 
operation such as inserting, searching, updating, or deleting. 
It's following the Node convention, and should be called as done(null, data) 
on success, or done(err) on error.*/

const Schema = mongoose.Schema;

const personSchema = new Schema({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: [String]
});

const Person = mongoose.model("Person", personSchema);

/*Within the createAndSavePerson function, create a document instance using 
the Person model constructor you built before. Pass to the constructor 
an object having the fields name, age, and favoriteFoods. 
Their types must conform to the ones in the personSchema. 
Then, call the method document.save() on the returned document instance. 
Pass to it a callback using the Node convention. This is a common pattern; 
all the following CRUD methods take a callback function like this as the 
last argument.*/


/** 3) Create and Save a Person */
var createAndSavePerson = function(done) {
  var janeFonda = new Person({name: "Jane Fonda", age: 84, favoriteFoods: ["eggs", "fish", "fresh fruit"]});

  janeFonda.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};

/** 4) Create many People with `Model.create()` 
 Sometimes you need to create many instances of your models, e.g. 
 when seeding a database with initial data. Model.create() takes an 
 array of objects like [{name: 'John', ...}, {...}, ...] as 
 the first argument, and saves them all in the db.*/

var arrayOfPeople = [
  {name: "Frankie", age: 74, favoriteFoods: ["Del Taco"]},
  {name: "Sol", age: 76, favoriteFoods: ["roast chicken"]},
  {name: "Robert", age: 78, favoriteFoods: ["wine"]}
];

var createManyPeople = function(arrayOfPeople, done) {
  Person.create(arrayOfPeople, function (err, people) {
    if (err) return console.log(err);
    done(null, people);
  });
};

/** 5) Use `Model.find()` 
In its simplest usage, Model.find() accepts a query document (a JSON object) 
as the first argument, then a callback. It returns an array of matches. 
It supports an extremely wide range of search options. Read more in the docs.
*/
var findPeopleByName = function(personName, done) {
  Person.find({name: personName}, function (err, personFound) {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

/** 6) Use `Model.findOne()` 
Model.findOne() behaves like Model.find(), but it returns only one 
document (not an array), even if there are multiple items. 
It is especially useful when searching by properties that you have 
declared as unique.
*/
var findOneByFood = function(food, done) {
  Person.findOne({favoriteFoods: food}, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
};

/** 7) Use `Model.findById()` 
When saving a document, MongoDB automatically adds the field _id, and set 
it to a unique alphanumeric key. Searching by _id is an extremely frequent 
operation, so Mongoose provides a dedicated method for it.*/

var findPersonById = function(personId, done) {
  Person.findById(personId, function (err, data) {
    if (err) return console.log(err);
    done(null, data);
  });
};

/** 8)Perform Classic Updates by Running Find, Edit, then Save` 
In the good old days, this was what you needed to do if you wanted to 
edit a document, and be able to use it somehow 
(e.g. sending it back in a server response). Mongoose has a dedicated 
updating method: Model.update(). It is bound to the low-level mongo driver. 
It can bulk-edit many documents matching certain criteria, but 
it doesn’t send back the updated document, only a 'status' message. 
Furthermore, it makes model validations difficult, because it just directly 
calls the mongo driver.*/

const findEditThenSave = (personId, done) => {
  const foodToAdd = 'hamburger';

  // .findById() method to find a person by _id with the parameter personId as search key. 
  Person.findById(personId, (err, person) => {
    if(err) return console.log(err); 
  
    // Array.push() method to add "hamburger" to the list of the person's favoriteFoods
    person.favoriteFoods.push(foodToAdd);

    // and inside the find callback - save() the updated Person.
    person.save((err, updatedPerson) => {
      if(err) return console.log(err);
      done(null, updatedPerson)
    })
  })
};

/** 9)Perform New Updates on a Document Using model.findOneAndUpdate()` 
Recent versions of Mongoose have methods to simplify documents updating. 
Some more advanced features (i.e. pre/post hooks, validation) behave 
differently with this approach, so the classic method is still useful in 
many situations. findByIdAndUpdate() can be used when searching by id.*/

const findAndUpdate = (personName, done) => {
  const ageToSet = 20;

  Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}, (err, updatedDoc) => {
    if(err) return console.log(err);
    done(null, updatedDoc);
  })
};

/** 10)Delete One Document Using model.findByIdAndRemove` 
findByIdAndRemove and findOneAndRemove are like the previous update methods. 
They pass the removed document to the db. As usual, use the function 
argument personId as the search key.

Modify the removeById function to delete one person by the person's _id. 
You should use one of the methods findByIdAndRemove() or findOneAndRemove().*/

var removeById = function(personId, done) {
  Person.findByIdAndRemove(
    personId,
    (err, removedDoc) => {
      if(err) return console.log(err);
      done(null, removedDoc);
    }
  ); 
};

/** 11)Delete Many Documents with model.remove()e` 
Model.remove() is useful to delete all the documents matching given criteria.

Modify the removeManyPeople function to delete all the people whose name is 
within the variable nameToRemove, using Model.remove(). Pass it to a query 
document with the name field set, and a callback.

Note: The Model.remove() doesn’t return the deleted document, 
but a JSON object containing the outcome of the operation, and the 
number of items affected. Don’t forget to pass it to the done() callback, 
since we use it in tests.*/

const removeManyPeople = (done) => {
  const nameToRemove = "Mary";
  Person.remove({name: nameToRemove}, (err, response) => {
    if(err) return console.log(err);
    done(null, response);
  })
};

/** 12)Chain Search Query Helpers to Narrow Search Results` 
If you don’t pass the callback as the last argument to Model.find() 
(or to the other search methods), the query is not executed. 
You can store the query in a variable for later use. 
This kind of object enables you to build up a query using chaining syntax. 
The actual db search is executed when you finally chain the method .exec(). 
You always need to pass your callback to this last method. 
There are many query helpers, here we'll use the most commonly used.*/

const queryChain = (done) => {
  const foodToSearch = "burrito";
  Person.find({ favoriteFoods: foodToSearch})
  .sort({ name: 1 })
  .limit(2)
  .select({age: 0 })
  .exec(function(error, people) {
    if (error) return console.log(error);
    done(null, people);
  });
  
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
