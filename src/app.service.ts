import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import axios from 'axios';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}
  async getHello() {
    const cachedValue = await this.cacheManager.get('my_test_key');
    if (cachedValue) {
      return cachedValue;
    }

    const response = await axios
      .get('https://api.publicapis.org/entries')
      .then((res) => res.data);

    await this.cacheManager.set('my_test_key', response);

    return response;
  }

  adminAccessibleApi() {
    return 'Admin Accessible API';
  }

  clientAccessibleApi() {
    return 'Client Accessible API';
  }
}
