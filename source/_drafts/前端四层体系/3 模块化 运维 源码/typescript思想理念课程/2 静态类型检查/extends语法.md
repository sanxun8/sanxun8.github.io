---
title: extends语法
---

在 TypeScript 中,extends 关键字用于实现面向对象编程中的继承机制。通过继承,可以创建一个新的类型,该类型包含父类型的所有属性和方法,同时还可以添加新的属性和方法或者重写父类型的属性和方法。

extends 关键字可以用于以下几种情况:

## 类的继承:

```typescript
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  breed: string;
  constructor(name: string, breed: string) {
    super(name);
    this.breed = breed;
  }
  speak() {
    console.log(`${this.name} the ${this.breed} dog barks.`);
  }
}

const myDog = new Dog("Buddy", "Labrador");
myDog.speak(); // Output: Buddy the Labrador dog barks.
```

## 接口的继承:

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  jobTitle: string;
  salary: number;
}

const john: Employee = {
  name: "John",
  age: 30,
  jobTitle: "Software Engineer",
  salary: 80000,
};
```

## 类型别名的继承:

```typescript
type Animal = {
  name: string;
  speak(): void;
};

type Dog = Animal & {
  breed: string;
  bark(): void;
};

const myDog: Dog = {
  name: "Buddy",
  breed: "Labrador",
  speak() {
    console.log(`${this.name} makes a sound.`);
  },
  bark() {
    console.log(`${this.name} the ${this.breed} dog barks.`);
  },
};
```

在上述示例中,Dog 类型通过 extends 关键字继承了 Animal 类型的所有属性和方法,并添加了自己的 breed 属性和 bark() 方法。同样地,Employee 接口也继承了 Person 接口的属性,并添加了自己的 jobTitle 和 salary 属性。

总之,extends 关键字是 TypeScript 中实现继承的主要方式,可以用于类、接口和类型别名的继承,提高代码的复用性和可维护性。
