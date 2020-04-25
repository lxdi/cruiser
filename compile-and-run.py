import subprocess
import os

print("-----------------------------------------Compilation----------------------------------")
process = subprocess.Popen(['./gradlew clean bootJar'], shell=True, stdout = subprocess.PIPE)
for line in process.stdout:
	print(line.decode('utf-8').replace('\n', ''))
process.wait()

warPath = os.path.join(os.getcwd(), 'backend', 'build', 'libs', 'ROOT.jar')
processjava = subprocess.Popen('java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005 -jar %s' % warPath, shell=True)
print(processjava.pid)

command = input('Command: ')

javapid = processjava.pid + 1
print('killing %s' % javapid)
subprocess.Popen('kill -9 %s' % javapid, shell=True)
