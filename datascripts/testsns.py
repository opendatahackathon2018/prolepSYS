# send notification
import boto3

sns = boto3.client('sns')
number = '+35799908367'
sns.publish(
    PhoneNumber=number,
    Message='Warning Fire near location. Caution is advised.',
    MessageAttributes={
        'AWS.SNS.SMS.SenderID': {
            'DataType': 'String',
            'StringValue': 'ProlepSYS'
        }
    }
)