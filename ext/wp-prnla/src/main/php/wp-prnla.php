<?php
/*
Plugin Name: WP-Prnla
Plugin URI: http://code.google.com/p/bitpress/wiki/WPPrnla
Description: Allows the use of Prnla http://prn.la as a shortlink / URL shortener.
Version: 0.1
Author: Cliffano Subagio
Author URI: http://blog.cliffano.com
*/

function wpprnla_shorten($long_url) {
    $prnla = 'http://prn.la/x?prn=' . urlencode($long_url);
    if (function_exists('curl_init')) {
        $session = curl_init($prnla);
        curl_setopt($session, CURLOPT_RETURNTRANSFER, true);
        $short_url = curl_exec($session);
        curl_close($session);
    } else {
        $short_url = file_get_contents($prnla);
    }
    return $short_url;
}

function wpprnla_get_shortlink($shortlink, $post_id, $context) {
    $shortlink = '';
    if ($context == 'post') {
        if (empty($post_id)) {
            global $post;
            $post_id = $post->ID;
        }
        $shortlink = get_post_meta($post_id, '_wpprnla', true);
        if ($shortlink == '' || $shortlink == false) {
            $permalink = get_permalink($post_id);
            $shortlink = wpprnla_shorten($permalink);
            if (strpos($shortlink, 'http://prn.la') === 0) {
                update_post_meta($post_id, '_wpprnla', $shortlink);
            } else {
                $shortlink = 'ERROR: ' . $shortlink;
            }
        }
    }
    return $shortlink;
}

add_filter('get_shortlink', 'wpprnla_get_shortlink', 10, 3);

?>