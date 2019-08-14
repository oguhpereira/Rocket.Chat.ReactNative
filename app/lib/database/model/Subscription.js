import { Model } from '@nozbe/watermelondb';
import { field, relation, date } from '@nozbe/watermelondb/decorators';

export default class Comment extends Model {
	static table = 'subscriptions';

	// static associations = {
	// 	posts: { type: 'belongs_to', key: 'post_id' }
	// };

	@field('f') f;

	@field('t') t;

	@date('ts') ts;

	@date('ls') ls;

	@field('name') name;

	@field('fname') fname;

	@field('rid') rid;

	@field('f') f;

	@field('open') open;

	@field('alert') alert;

	// @field('roles') roles;

	@field('unread') unread;

	@field('user_mentions') userMentions;

	@date('room_updated_at') roomUpdatedAt;

	@field('ro') ro;

	@date('last_open') lastOpen;

	// @field('last_message') lastMessage;

	@field('description') description;

	@field('announcement') announcement;

	@field('topic') topic;

	@field('blocked') blocked;

	@field('blocker') blocker;

	@field('react_when_read_only') reactWhenReadOnly;

	@field('archived') archived;

	@field('join_code_required') joinCodeRequired;

	@field('notifications') notifications;

	// @field('muted') muted;
	@field('broadcast') broadcast;

	@field('prid') prid;

	@field('draft_message') draftMessage;

	@date('last_thread_sync') lastThreadSync;

	@field('auto_translate') autoTranslate;

	@field('auto_translate_language') autoTranslateLanguage;
}