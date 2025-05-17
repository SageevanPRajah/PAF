package com.roboticgen.nexus.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import java.util.HashMap;
import java.util.Map;

public class CustomAuthorizationRequestResolver
    implements OAuth2AuthorizationRequestResolver {

    private final DefaultOAuth2AuthorizationRequestResolver defaultResolver;

    public CustomAuthorizationRequestResolver(
        ClientRegistrationRepository repo,
        String authorizationRequestBaseUri
    ) {
        this.defaultResolver =
            new DefaultOAuth2AuthorizationRequestResolver(repo, authorizationRequestBaseUri);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request);
        return customize(req, request);
    }

    @Override
    public OAuth2AuthorizationRequest resolve(
        HttpServletRequest request, String clientRegistrationId
    ) {
        OAuth2AuthorizationRequest req = defaultResolver.resolve(request, clientRegistrationId);
        return customize(req, request);
    }

    private OAuth2AuthorizationRequest customize(
        OAuth2AuthorizationRequest req, HttpServletRequest request
    ) {
        if (req == null) return null;
        String role = request.getParameter("role");
        if (role != null) {
            Map<String,Object> extras = new HashMap<>(req.getAdditionalParameters());
            extras.put("role", role);
            return OAuth2AuthorizationRequest.from(req)
                .additionalParameters(extras)
                .build();
        }
        return req;
    }
}
