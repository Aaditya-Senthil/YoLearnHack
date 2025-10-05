import fs from 'fs';
import pkg from '@aws-sdk/client-kinesis-video-signaling';
const { KinesisVideoSignalingClient, PutChannelPolicyCommand } = pkg;

const channelArn = 'arn:aws:kinesisvideo:ap-south-1:682371128887:channel/CompanionMeetChannel/1759628966213';
const policyPath = './channel-policy.json';

async function updateChannelPolicy() {
  try {
    const policyJson = fs.readFileSync(policyPath, 'utf8');
    const policy = JSON.parse(policyJson);

    const client = new KinesisVideoSignalingClient({ region: 'ap-south-1' });

    const command = new PutChannelPolicyCommand({
      ChannelARN: channelArn,
      Policy: JSON.stringify(policy),
    });

    const response = await client.send(command);
    console.log('Policy updated successfully:', response);
  } catch (err) {
    console.error('Error updating channel policy:', err);
  }
}

updateChannelPolicy();
