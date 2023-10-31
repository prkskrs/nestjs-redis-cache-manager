import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  async getHello() {
    // practice example : 1
    // await this.cacheManager.set('cached_item', { key: 32 }, 10); // to set cache (keyName, valueToCache, timetolive)
    // await this.cacheManager.del('cached_item'); // to delete cache
    // await this.cacheManager.reset(); // to reset or delete every cache
    // const cachedValue = await this.cacheManager.get('cached_item');

    // example : 2
    // await this.cacheManager.set(
    //   'cached_list',
    //   {
    //     key: 'prakash',
    //   },
    //   5,
    // );
    // // await this.cacheManager.del('cached_list'); // to delete cache ̰
    // const cachedValue = await this.cacheManager.get('cached_list');
    // console.log('cachedValue => ', cachedValue);

    // example : 3
    const cachedValue = await this.cacheManager.get('my_test_key');
    if (cachedValue) {
      console.log('cachedValue', cachedValue);
      return cachedValue;
    }
    const response = await axios
      .get('https://api.publicapis.org/entries')
      .then((res) => res.data);

    await this.cacheManager.set('my_test_key', response, 2);
    return response;
  }

  adminAccessibleApi() {
    return 'Admin Accessible API';
  }

  clientAccessibleApi() {
    return 'Client Accessible API';
  }
}
