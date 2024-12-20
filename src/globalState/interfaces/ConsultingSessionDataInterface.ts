import { TopicsDataInterface } from './TopicsDataInterface';

export interface ConsultingSessionDataInterface {
	age: number;
	agencyId: number;
	askerId: string;
	askerRcId: string;
	askerUserName: string;
	consultantId: string;
	consultantRcId: string;
	consultingType: number;
	counsellingRelation: string;
	gender: string;
	groupId: string;
	id: number;
	mainTopic: TopicsDataInterface;
	postcode: string;
	topics: TopicsDataInterface[];
}
