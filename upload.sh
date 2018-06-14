bundle exec middleman build --clean

for target in "$@"
do
	case "$target" in
		alpha.stratifyd.com)
			echo "Sending to $target";
			aws s3 sync ./build "s3://$target/excrawler" --region us-east-1 --size-only --exact-timestamps;
			# aws s3 cp --region us-east-1	"$dist/Release.zip" "s3://taste.client.endpoints.web.assets/$target/" | grep -e fail -e error
			# aws s3 cp --region us-east-1	__build__ "s3://taste.client.endpoints.web.assets/$target/version" | grep -e fail -e error
			;;
		*\.tasteanalytics\.com	| *\.stratifyd\.com )
			echo "Sending to $target"
			# build_scripts/s3uploader.sh "$target"
			# s3cmd sync ./dist/Release "s3://$target" --acl-public --delete-removed
			aws s3 sync ./build "s3://$target/excrawler" --region us-west-2 --size-only --exact-timestamps;
			# aws s3 cp --recursive ./dist/Release "s3://$target/" --region us-west-2;
			;;
	esac
	echo 'Done'
	echo ''
done
