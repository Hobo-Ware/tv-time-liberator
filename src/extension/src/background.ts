import browser from 'webextension-polyfill';
import { toIMDB } from '../../core/api';
import { listener } from './request/listener/listener';
import { Topic } from './request/topic/Topic';

listener(Topic.IMDB, async ({ id, type }) => await toIMDB(id, type));
