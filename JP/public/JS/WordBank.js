//Author: Vincent Siu
//Filename: WordBank.js
//Description: Contains hashtable to hold words and provide searching of the words in a efficient matter
//Last Update: wrapped up documentation

//used to store the words that we parse from the file, which is done in ParseWordBank.js
class HashTable {
  //97 b/c prime numbers better for hashtables
  constructor(size=97){
    this.buckets =  new Array(size)
    this.size = size
    this.num_words = 0
  }

  //hash function for the hashtable, takes a word computes hash value by adding total char code of all chars
  hash(word){
      word = word.toUpperCase();
      let hash_value = 0;
      for(let i = 0; i < word.length; i++) {
        hash_value += word.charCodeAt(i);
      }
      hash_value = hash_value % this.size;
      return hash_value;
  }

  //insert a word into the hashtable. the key is part of the value so you only need to provide value
  //to implement separate chaining, the first time a bucket gets used/inserted into, it will create an array
  //increments num_words by one every time we insert
  insert(word){
    word = word.toUpperCase();
    let index = this.hash(word)
    
    if(!this.buckets[index]){
      this.buckets[index] = [];
    }
    this.buckets[index].push(word)
    this.num_words++;
  }

  //search for a word in the hashtable, returns true if found, returns false if not
  search(word) {
    word = word.toUpperCase();
    let index = this.hash(word)
    if(!this.buckets[index]){ //if no array that bucket, no elements, and if we call a includes we will segfault
      return false
    }
    else
      return this.buckets[index].includes(word) //includes saves us the trouble of looping through the array
  }

  //return the amount of words in the hashtable across all buckets
  //everytime a word is inserted this data member is incremented
  num_words() {
    return this.num_words
  }

  //prints the entire hashtable including empty buckets
  print_all() {
    for(let index = 0; index < this.size;index++)
    {
      console.log(this.buckets[index])
    }
  }
}