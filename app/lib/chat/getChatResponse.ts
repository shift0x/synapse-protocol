import {getChatTopic} from './getChatTopic'
import {getSubjectMatterExpert} from '../experts/getSubjectMatterExpert'

export const getChatResponse = async(prompt: string) : Promise<string> => {
    const topic = await getChatTopic(prompt)
    const expert = await getSubjectMatterExpert(topic.topic, topic.specialization)

    return topic
}